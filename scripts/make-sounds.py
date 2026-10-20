import math, random, struct, sys, wave
R = 22050
out = sys.argv[1]
random.seed(7)

def save(name, samples):
    peak = max(1e-9, max(abs(s) for s in samples))
    with wave.open(f'{out}/{name}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
        w.writeframes(b''.join(struct.pack('<h', int(s / peak * 0.8 * 32767)) for s in samples))

def env(i, n, attack=0.01, release=0.3):
    t = i / R; dur = n / R
    a = min(1, t / attack) if attack else 1
    r = min(1, (dur - t) / (dur * release)) if release else 1
    return a * max(0, r)

def tone(freq, dur, kind='sine', decay=6.0):
    n = int(R * dur); res = []
    for i in range(n):
        t = i / R; ph = 2 * math.pi * freq * t
        v = math.sin(ph) if kind == 'sine' else (1 if math.sin(ph) > 0 else -1) * 0.5 + math.sin(ph) * 0.5
        res.append(v * math.exp(-decay * t) * env(i, n, 0.005, 0.1))
    return res

def mix(*tracks):
    n = max(len(t) for t, _ in tracks); res = [0.0] * n
    for t, off in tracks:
        o = int(off * R)
        for i, v in enumerate(t):
            if o + i < n: res[o + i] += v
    return res

def pad(t, dur):
    return t + [0.0] * max(0, int(dur * R) - len(t))

# No pass or flick sound for now: John wants those moments silent until new ones are chosen.

# The earlier pass and flick sounds drew these random numbers; drawing them
# still keeps boom and drumroll exactly as they were.
for _ in range(int(R * 0.45) + int(R * 0.35)):
    random.uniform(-1, 1)

save('pop', [math.sin(2 * math.pi * (500 + 900 * i / R / 0.08) * i / R) * math.exp(-40 * i / R) for i in range(int(R * 0.12))])
save('tap', tone(880, 0.07, decay=40))

# Boom: low sine drop plus rumble.
boom = []; y = 0
for i in range(int(R * 1.1)):
    t = i / R; f = 110 * math.exp(-2.5 * t) + 35
    y += 0.08 * (random.uniform(-1, 1) - y)
    boom.append((math.sin(2 * math.pi * f * t) + y * 1.5) * math.exp(-3 * t))
save('boom', boom)

# Drumroll: fast noisy snare hits getting louder.
roll = []
for k in range(36):
    hit = [random.uniform(-1, 1) * math.exp(-45 * i / R) * (0.3 + 0.7 * k / 36) for i in range(int(R * 0.05))]
    roll.append((hit, k * 0.045))
save('drumroll', pad(mix(*roll), 1.7))

# Fanfare: a rising major arpeggio ending on a held chord.
notes = [(523.25, 0), (659.25, 0.12), (783.99, 0.24), (1046.5, 0.36)]
parts = [(tone(f, 0.25, 'square', 8), o) for f, o in notes]
parts += [(tone(f, 1.0, 'square', 2.5), 0.5) for f in (523.25, 659.25, 783.99, 1046.5)]
save('fanfare', mix(*parts))
