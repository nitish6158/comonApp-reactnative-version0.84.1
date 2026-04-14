package io.comon.app;

import android.content.Context;
import android.media.AudioManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class AudioFocusModule extends ReactContextBaseJavaModule {

    private AudioManager audioManager;

    public AudioFocusModule(ReactApplicationContext reactContext) {
        super(reactContext);
        audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
    }

    @Override
    public String getName() {
        return "AudioFocusModule";
    }

    @ReactMethod
    public void stopExternalMediaFocus() {
        audioManager.requestAudioFocus(null, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
    }

    @ReactMethod
    public void releaseAudioFocus() {
        audioManager.abandonAudioFocus(null);
    }
}
