import { askCameraPermission } from '@/utils/permission';
import {
  requestCameraPermission,
  requestUserPermission,
} from '@/utils/permissionUtils';

describe('permissionUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requestCameraPermission maps true → granted', async () => {
    (askCameraPermission as jest.Mock).mockResolvedValueOnce(true);
    await expect(requestCameraPermission()).resolves.toBe('granted');
  });

  it('requestCameraPermission maps false → denied', async () => {
    (askCameraPermission as jest.Mock).mockResolvedValueOnce(false);
    await expect(requestCameraPermission()).resolves.toBe('denied');
  });

  it('requestCameraPermission maps thrown errors → denied', async () => {
    (askCameraPermission as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    await expect(requestCameraPermission()).resolves.toBe('denied');
  });

  it('requestUserPermission requests FCM permission when authorized', async () => {
    await expect(requestUserPermission()).resolves.toBeUndefined();
  });
});
