import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  const bars = [0.35, 0.6, 0.9, 1, 0.7, 0.4, 0.55];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4338CA 0%, #5B4FE9 55%, #6D28D9 100%)',
          padding: 80,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: `${h * 160}px`,
                borderRadius: 9,
                background: i === 3 ? '#FF6B4A' : 'rgba(255,255,255,0.85)',
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 84,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: -2,
          }}
        >
          SpeakEase
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            color: 'rgba(255,255,255,0.85)',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          Practice speaking English with an AI that remembers you
        </div>
      </div>
    ),
    { ...size }
  );
}
