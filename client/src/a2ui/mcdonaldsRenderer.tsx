import React, { useEffect, useState } from 'react';
import { MessageProcessor, type SurfaceModel, type A2uiClientAction } from '@a2ui/web_core/v0_9';
import { basicCatalog, A2uiSurface, type ReactComponentImplementation } from '@a2ui/react/v0_9';
import { injectStyles, removeStyles } from '@a2ui/react/styles';
import { A2UIMessage } from './types';

interface McDonaldsRendererProps {
  messages: A2UIMessage[];
  onAction?: (action: A2uiClientAction) => void;
}

/**
 * McDonald's A2UI Native Renderer using Google's @a2ui/react SDK.
 * Handles surface creation, component tree mounting, two-way data binding, and user action dispatching.
 */
export const McDonaldsRenderer: React.FC<McDonaldsRendererProps> = ({
  messages,
  onAction,
}) => {
  const [processor, setProcessor] = useState<MessageProcessor<ReactComponentImplementation> | null>(null);
  const [surfaces, setSurfaces] = useState<SurfaceModel<ReactComponentImplementation>[]>([]);

  useEffect(() => {
    injectStyles();
    return () => {
      removeStyles();
    };
  }, []);

  useEffect(() => {
    const newProcessor = new MessageProcessor<ReactComponentImplementation>(
      [basicCatalog],
      async (action: A2uiClientAction) => {
        console.log('[@a2ui/react Action Emitted]', action);
        if (onAction) {
          onAction(action);
        }
      }
    );

    if (messages && messages.length > 0) {
      newProcessor.processMessages(structuredClone(messages) as any);
    }

    setProcessor(newProcessor);
    setSurfaces(Array.from(newProcessor.model.surfacesMap.values()));

    return () => {
      newProcessor.model.dispose();
    };
  }, [messages, onAction]);

  if (!processor || surfaces.length === 0) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        background: '#ffffff',
        border: '2px dashed #e0e0e0',
        borderRadius: '16px',
        color: '#666666',
        margin: '20px auto',
        maxWidth: '600px'
      }}>
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>
          Waiting for @a2ui/react McDonald's surface stream...
        </p>
      </div>
    );
  }

  return (
    <div className="a2ui-surface-wrapper" style={{ width: '100%' }}>
      {surfaces.map((surface) => (
        <div
          key={surface.id}
          className="a2ui-kiosk-card-container"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
          }}
        >
          <A2uiSurface surface={surface} />
        </div>
      ))}
    </div>
  );
};

// Aliases for compatibility
export const MacdonalRenderer = McDonaldsRenderer;
export const OfficialA2UIRenderer = McDonaldsRenderer;
