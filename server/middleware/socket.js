// Socket.IO middleware để inject io vào routes
let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const getIO = () => {
  return ioInstance;
};

module.exports = {
  setIO,
  getIO
}; 