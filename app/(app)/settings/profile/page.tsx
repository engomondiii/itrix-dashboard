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

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    errors.clear();
    setSaved(false);
    setSaving(true);

    try {
      await updateProfile({ first_name: firstName, last_name: lastName });
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
          label="First name"
          name="first_name"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.errorFor('first_name')}
        />
        <Field
          label="Last name"
          name="last_name"
          autoComplete="family-name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={errors.errorFor('last_name')}
        />
      </SettingsSection>
    </form>
  );
}
