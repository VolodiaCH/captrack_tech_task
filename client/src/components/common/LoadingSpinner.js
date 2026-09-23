import { jsx as _jsx } from "react/jsx-runtime";
export function LoadingSpinner() {
    return (_jsx("div", { style: {
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '3px solid var(--color-border)',
            borderTop: '3px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
        }, children: _jsx("style", { children: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        ` }) }));
}
