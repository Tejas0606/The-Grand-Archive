const Message = require('../models/Message');
const User = require('../models/User');

// Map: userId -> Set of socket IDs
const userSocketMap = new Map();
// Map: roomId -> Set of userIds currently in room
const roomMembersMap = new Map();

let socketIoInstance = null;

const initSocket = (io) => {
  socketIoInstance = io;

  io.on('connection', (socket) => {
    let currentUserId = null;
    let currentRoomId = null;

    // 1. Register User for Direct Real-time Notifications
    socket.on('register_user', (userId) => {
      if (!userId) return;
      currentUserId = userId.toString();

      if (!userSocketMap.has(currentUserId)) {
        userSocketMap.set(currentUserId, new Set());
      }
      userSocketMap.get(currentUserId).add(socket.id);
    });

    // 2. Join a Literary Reading Room / Author AMA
    socket.on('join_room', async ({ roomId, user }) => {
      if (!roomId) return;
      currentRoomId = roomId;
      socket.join(roomId);

      if (!roomMembersMap.has(roomId)) {
        roomMembersMap.set(roomId, new Set());
      }
      if (user && user._id) {
        roomMembersMap.get(roomId).add(user._id.toString());
      }

      const memberCount = roomMembersMap.get(roomId).size;

      // Broadcast room presence count
      io.to(roomId).emit('room_stats', {
        roomId,
        memberCount: Math.max(memberCount, 1)
      });

      if (user && user.name) {
        socket.to(roomId).emit('user_joined_notice', {
          text: `${user.name} entered the parlor.`,
          user
        });
      }
    });

    // 3. Leave Room
    socket.on('leave_room', ({ roomId, user }) => {
      if (!roomId) return;
      socket.leave(roomId);

      if (roomMembersMap.has(roomId) && user && user._id) {
        roomMembersMap.get(roomId).delete(user._id.toString());
        const count = roomMembersMap.get(roomId).size;
        io.to(roomId).emit('room_stats', {
          roomId,
          memberCount: count
        });
      }
    });

    // 4. Send & Broadcast Message
    socket.on('send_message', async ({ roomId, senderId, text }) => {
      if (!roomId || !senderId || !text || !text.trim()) return;

      try {
        const savedMessage = await Message.create({
          room: roomId,
          sender: senderId,
          text: text.trim()
        });

        const populatedMessage = await Message.findById(savedMessage._id)
          .populate('sender', 'name username avatar role penName');

        // Emit to everyone in the room (including sender)
        io.to(roomId).emit('receive_message', populatedMessage);
      } catch (err) {
        console.error('[Socket Message Save Error]:', err.message);
        socket.emit('message_error', { message: 'Could not preserve your thoughts to the parlor record.' });
      }
    });

    // 5. Typing Indicators
    socket.on('typing', ({ roomId, username, name }) => {
      if (!roomId) return;
      socket.to(roomId).emit('user_typing', { username, name });
    });

    socket.on('stop_typing', ({ roomId }) => {
      if (!roomId) return;
      socket.to(roomId).emit('user_stop_typing');
    });

    // 6. Disconnect
    socket.on('disconnect', () => {
      if (currentUserId && userSocketMap.has(currentUserId)) {
        userSocketMap.get(currentUserId).delete(socket.id);
        if (userSocketMap.get(currentUserId).size === 0) {
          userSocketMap.delete(currentUserId);
        }
      }

      if (currentRoomId && roomMembersMap.has(currentRoomId) && currentUserId) {
        roomMembersMap.get(currentRoomId).delete(currentUserId);
        const count = roomMembersMap.get(currentRoomId).size;
        io.to(currentRoomId).emit('room_stats', {
          roomId: currentRoomId,
          memberCount: count
        });
      }
    });
  });
};

/**
 * Emit notification to a specific user if online
 */
const emitNotification = (recipientId, notification) => {
  if (!socketIoInstance || !recipientId) return;

  const targetSocketIds = userSocketMap.get(recipientId.toString());
  if (targetSocketIds && targetSocketIds.size > 0) {
    for (const socketId of targetSocketIds) {
      socketIoInstance.to(socketId).emit('new_notification', notification);
    }
  }
};

module.exports = {
  initSocket,
  emitNotification
};
