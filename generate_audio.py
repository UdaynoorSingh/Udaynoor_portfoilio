import numpy as np
from scipy.io import wavfile
import os

os.makedirs('public/audio', exist_ok=True)
sample_rate = 44100
duration = 45
t = np.linspace(0, duration, int(sample_rate * duration), False)

# Very soft, deep drone (sub bass)
# 65.41 Hz is C2. Multiple pure sines slightly detuned for a chorus/pad effect
f_base = 65.41
drone = np.zeros_like(t)
for detune in [-0.2, 0.0, 0.2]:
    drone += np.sin(2 * np.pi * (f_base + detune) * t)
drone *= 0.3

# Higher ethereal glass-like notes (C major 9)
glass_freqs = [261.63, 329.63, 392.00, 493.88, 523.25]
glass = np.zeros_like(t)

for i, f in enumerate(glass_freqs):
    # Very slow LFO for volume to create a "breathing" organic pad
    lfo_rate = 0.02 + i * 0.01
    vol_lfo = 0.5 + 0.5 * np.sin(2 * np.pi * lfo_rate * t)
    
    # Very subtle pitch modulation (vibrato) for a smooth sci-fi feel
    vib_rate = 3.0 + i * 0.5
    vibrato = np.sin(2 * np.pi * vib_rate * t) * 0.5 # phase modulation
    
    glass += vol_lfo * np.sin(2 * np.pi * f * t + vibrato)

glass *= 0.1 # Keep it very soft and ethereal

# Mix audio (NO NOISE/STATIC added to prevent buzzing)
audio = drone + glass

# Smooth Master Envelope
fade_in = np.minimum(t / 10.0, 1.0)
fade_out = np.minimum((duration - t) / 10.0, 1.0)
audio *= (fade_in * fade_out)

# Normalize and convert (70% max volume)
audio = audio / np.max(np.abs(audio)) * 0.7
audio_int16 = np.int16(audio * 32767)
wavfile.write('public/audio/space_drone.wav', sample_rate, audio_int16)
print("Pure cinematic pad generated successfully at public/audio/space_drone.wav")
