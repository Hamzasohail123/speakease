import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

// A simple waveform mark — bars of varying height reading as "voice" — on the
// brand indigo. Generated as code so there's a real, on-brand favicon with no
// external asset pipeline.
export default function Icon() {
  const bars = [0.45, 0.75, 1, 0.6, 0.35];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#5B4FE9',
          borderRadius: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: '55%' }}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: `${h * 100}%`,
                borderRadius: 3,
                background: i === 2 ? '#FF6B4A' : '#FFFFFF',
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
