'use client';

/**
 * Profile settings.
 *
 * Each settings form owns its state and talks to its own endpoint — linking
 * sections' submit states (one `saving` flag, one error slot) is how a
 * failed password change ends up wiping profile edits. Errors flow through
 * the same `normalizeError` round trip the login page demonstrates, via the
 * shared `useFieldErrors` helper.
 */

import { useState, type FormEvent } from 'react';

import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormAlert, useFieldErrors } from '@/components/ui/form-feedback';
import { SettingsSection } from '@/components/ui/settings-section';

export default function ProfileSettingsPage() {
  const { user, updateProfile } = useAuth();
  const errors = useFieldErrors();

  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    errors.clear();
    setSaved(false);
    setSaving(true);

    try {
      await updateProfile({ name });
      setSaved(true);
    } catch (error) {
      errors.absorb(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SettingsSection
        title="Profile"
        description={`Signed in as ${user?.email ?? ''}. Name changes apply everywhere your account appears.`}
        footer={
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        }
      >
        {errors.formError && <FormAlert tone="error" message={errors.formError} />}
        {saved && <FormAlert tone="success" message="Profile updated." />}

        <Field
          label="Name"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.errorFor('name')}
        />
      </SettingsSection>
    </form>
  );
}
