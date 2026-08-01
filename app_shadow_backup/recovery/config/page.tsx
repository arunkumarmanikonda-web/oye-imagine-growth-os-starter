import { providerCatalog } from '../../../src/lib/config-control/provider-catalog';

export default function RecoveryConfigPage() {
  const providers = Object.values(providerCatalog);

  return (
    <main style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Recovery Config Control Plane</h1>
      <p>
        This temporary recovery surface exists to unblock provider configuration,
        secret rotation planning, and runtime sync design while the main admin
        surface is being repaired.
      </p>

      <div style={{ marginTop: '24px', marginBottom: '24px' }}>
        <strong>Health:</strong> <code>/api/health</code><br />
        <strong>Provider registry:</strong> <code>/api/recovery/config/providers</code><br />
        <strong>Bootstrap endpoint:</strong> <code>/api/recovery/config/bootstrap</code>
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '16px',
        }}
      >
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Provider</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Required Keys</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Optional Keys</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Targets</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider.provider}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{provider.label}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <ul>
                  {provider.requiredKeys.map((key) => (
                    <li key={key}><code>{key}</code></li>
                  ))}
                </ul>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <ul>
                  {provider.optionalKeys.map((key) => (
                    <li key={key}><code>{key}</code></li>
                  ))}
                </ul>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {provider.syncTargets.join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}