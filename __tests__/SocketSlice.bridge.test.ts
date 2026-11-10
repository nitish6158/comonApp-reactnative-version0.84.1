describe('SocketSlice legacy socket bridge', () => {
  function loadBridge() {
    jest.resetModules();
    const { socketConnect } = require('@/utils/socket/SocketConnection');
    const live = {
      connected: true,
      id: 'mock-socket-id',
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      disconnect: jest.fn(),
    };
    (socketConnect.getSocket as jest.Mock).mockReturnValue(live);
    const slice = require('@/redux/Reducer/SocketSlice');
    return { ...slice, socketConnect, live };
  }

  it('socket.emit uses live socket when connected', () => {
    const { socket, live } = loadBridge();
    socket.emit('sendChat', { roomId: 'r1' });
    expect(live.emit).toHaveBeenCalledWith('sendChat', { roomId: 'r1' });
  });

  it('socket.emit falls back to socketConnect.emit when disconnected', () => {
    const { socket, socketConnect } = loadBridge();
    (socketConnect.getSocket as jest.Mock).mockReturnValue(null);
    socket.emit('getProfile', {});
    expect(socketConnect.emit).toHaveBeenCalled();
  });

  it('socket.disconnect delegates to socketConnect.disconnect', () => {
    const { socket, socketConnect } = loadBridge();
    socket.disconnect();
    expect(socketConnect.disconnect).toHaveBeenCalled();
  });

  it('connectToSocket action exists (bridge, no second io client)', () => {
    const { connectToSocket } = loadBridge();
    expect(typeof connectToSocket).toBe('function');
    const action = connectToSocket('token');
    expect(action.type).toBe('socket/connectToSocket');
  });
});
