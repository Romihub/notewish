"use client";

import React, { useState, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { TemplateProps, TemplateRenderer } from '@/types/template';

export function withPageRenderer(WrappedComponent: React.ComponentType<TemplateProps>) {
  
  const WithPageRenderer = forwardRef<TemplateRenderer, TemplateProps>((props, ref) => {
    const { initialPage = 0, ...rest } = props;
    const [page, setPage] = useState(initialPage);

    useEffect(() => {
      setPage(initialPage);
    }, [initialPage]);

    const renderer = useMemo<TemplateRenderer>(() => ({
      setPage: (newPage) => setPage(newPage),
      getTotalPages: () => 0, // This should be implemented by the wrapped component if needed
    }), []);

    useImperativeHandle(ref, () => renderer, [renderer]);

    const componentProps: TemplateProps = {
      ...rest,
      renderer,
      // The actual page state is managed internally by the template now,
      // but we pass the initial page for server rendering.
      // The template needs to use this to set its initial state.
      initialPage: page, 
    } as TemplateProps;

    return <WrappedComponent {...componentProps} />;
  });

  WithPageRenderer.displayName = `withPageRenderer(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithPageRenderer;
}
