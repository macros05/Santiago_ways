import { generateCompostelaHTML } from '@lib/compostela';

type Input = Parameters<typeof generateCompostelaHTML>[0];

function makeInput(overrides: Partial<Input> = {}): Input {
  const base = {
    entry: {
      date: '2026-05-01T00:00:00.000Z',
      title: 'Día 1',
      body: 'Caminé bajo la lluvia.',
      images: [] as string[],
    },
    user: { name: 'María', nationality: 'ES' },
    stamps: [],
    routeName: 'Camino Francés',
    startDate: '2026-04-20T00:00:00.000Z',
    publicUrl: null,
  };
  return { ...base, ...overrides } as unknown as Input;
}

describe('generateCompostelaHTML', () => {
  it('produces a full HTML document', () => {
    const html = generateCompostelaHTML(makeInput());
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Compostela');
    expect(html).toContain('María');
    expect(html).toContain('Camino Francés');
  });

  it('escapes HTML in user content to prevent injection', () => {
    const html = generateCompostelaHTML(
      makeInput({
        entry: {
          date: '2026-05-01T00:00:00.000Z',
          title: '<script>alert(1)</script>',
          body: 'a & b < c > d "q" \'x\'',
          images: [],
        } as unknown as Input['entry'],
      }),
    );
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;');
  });

  it('shows an empty-state message when there are no stamps', () => {
    const html = generateCompostelaHTML(makeInput({ stamps: [] }));
    expect(html).toContain('Sin sellos registrados');
  });

  it('embeds a QR image only when a public URL is provided', () => {
    expect(generateCompostelaHTML(makeInput({ publicUrl: null }))).not.toContain('qrserver.com');
    const withUrl = generateCompostelaHTML(
      makeInput({ publicUrl: 'https://santiagoways.app/d/abc123' }),
    );
    expect(withUrl).toContain('qrserver.com');
  });
});
