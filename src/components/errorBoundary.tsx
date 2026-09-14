import { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <Result
        status="error"
        title="Alguna cosa ha fallat"
        subTitle="Torna-ho a provar recarregant la pàgina."
        extra={<Button type="primary" onClick={() => location.reload()}>Recarregar</Button>}
      />
    );
  }
}
