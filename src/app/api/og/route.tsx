import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Get parameters with defaults
  const title = searchParams.get('title') || 'IndustryDB';
  const subtitle = searchParams.get('subtitle') || 'Industry-specific business data. Verified. Affordable.';
  const stat1 = searchParams.get('stat1') || '82,740+';
  const stat1Label = searchParams.get('stat1Label') || 'Verified Leads';
  const stat2 = searchParams.get('stat2') || '184';
  const stat2Label = searchParams.get('stat2Label') || 'Countries';
  const stat3 = searchParams.get('stat3') || '20+';
  const stat3Label = searchParams.get('stat3Label') || 'Industries';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        }}
      >
        {/* Logo and Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          {/* Database Icon */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5V19A9 3 0 0 0 21 19V5" />
            <path d="M3 12A9 3 0 0 0 21 12" />
          </svg>
          <span
            style={{
              marginLeft: 16,
              fontSize: 48,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            {title}
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#94a3b8',
            marginBottom: 60,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          {subtitle}
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'flex',
            gap: 80,
          }}
        >
          {/* Stat 1 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 'bold',
                color: '#3b82f6',
              }}
            >
              {stat1}
            </span>
            <span
              style={{
                fontSize: 18,
                color: '#94a3b8',
                marginTop: 8,
              }}
            >
              {stat1Label}
            </span>
          </div>

          {/* Stat 2 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 'bold',
                color: '#3b82f6',
              }}
            >
              {stat2}
            </span>
            <span
              style={{
                fontSize: 18,
                color: '#94a3b8',
                marginTop: 8,
              }}
            >
              {stat2Label}
            </span>
          </div>

          {/* Stat 3 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 'bold',
                color: '#3b82f6',
              }}
            >
              {stat3}
            </span>
            <span
              style={{
                fontSize: 18,
                color: '#94a3b8',
                marginTop: 8,
              }}
            >
              {stat3Label}
            </span>
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 20,
            color: '#64748b',
          }}
        >
          industrydb.io
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
