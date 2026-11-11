import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

function renderTabs() {
  render(
    <Tabs defaultValue="progress">
      <TabsList aria-label="Student profili">
        <TabsTrigger value="progress">Progress</TabsTrigger>
        <TabsTrigger value="tokens">Ota-ona tokenlari</TabsTrigger>
        <TabsTrigger value="chat" disabled>
          Chat
        </TabsTrigger>
      </TabsList>
      <TabsContent value="progress">Progress mazmuni</TabsContent>
      <TabsContent value="tokens">Tokenlar mazmuni</TabsContent>
    </Tabs>,
  );
}

describe('Tabs', () => {
  it('rollar va tanlangan tab', () => {
    renderTabs();
    expect(screen.getByRole('tablist', { name: 'Student profili' })).toBeInTheDocument();
    const progress = screen.getByRole('tab', { name: 'Progress' });
    expect(progress).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Progress' })).toHaveTextContent(
      'Progress mazmuni',
    );
  });

  it('bosish bilan almashadi', async () => {
    renderTabs();
    await userEvent.click(screen.getByRole('tab', { name: 'Ota-ona tokenlari' }));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Tokenlar mazmuni');
  });

  it('strelka tugmasi bilan roving fokus, disabled tab o`tkazib yuboriladi', async () => {
    renderTabs();
    await userEvent.tab();
    expect(screen.getByRole('tab', { name: 'Progress' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const tokens = screen.getByRole('tab', { name: 'Ota-ona tokenlari' });
    expect(tokens).toHaveFocus();
    expect(tokens).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Progress' })).toHaveFocus();
  });
});
