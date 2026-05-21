import * as RT from '@radix-ui/react-tooltip';

export function TooltipProvider({ children, delayDuration = 200 }) {
  return <RT.Provider delayDuration={delayDuration}>{children}</RT.Provider>;
}

export function Tooltip({ children, content, side = 'top' }) {
  if (!content) return children;
  return (
    <RT.Root>
      <RT.Trigger asChild>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          sideOffset={6}
          style={{
            background: '#1f2328',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 12,
            zIndex: 50,
          }}
        >
          {content}
          <RT.Arrow style={{ fill: '#1f2328' }} />
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  );
}
