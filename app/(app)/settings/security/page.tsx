'use client';

/**
 * Security settings — password change.
 *
 * The form sends dj-rest-auth's field names (`old_password`,
 * `new_password1`, `new_password2`); the server validates strength and
 * whether `old_password` is right. This form checks only what the client
 * can actually know: that the two entries match.
 *
 * When the backend grows session management (active devices, revoke all),
 * it becomes a second `<SettingsSection>` on this same page.
 */

import { useState, type FormEvent } from 'react';

import { AuthAPI } from '@/lib/auth/auth-api';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { FormAlert, useFieldErrors } from '@/components/ui/form-feedback';
import { SettingsSection } from '@/components/ui/settings-section';

export default function SecuritySettingsPage() {
  const errors = useFieldErrors();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [changed, setChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    errors.clear();
    setChanged(false);

    if (newPassword1 !== newPassword2) {
      errors.absorb({
        // Shaped like an axios error so absorb() needs no special case.
        response: {
          data: {
            error: {
              type: 'validation_error',
              message: 'Please correct the errors below.',
              detail: [
                { field: 'new_password2', code: 'mismatch', message: 'Passwords do not match.' },
              ],
            },
          },
        },
        isAxiosError: true,
      });
      return;
    }

    setSaving(true);
    try {
      await AuthAPI.changePassword({
        old_password: oldPassword,
        new_password1: newPassword1,
        new_password2: newPassword2,
      });
      setChanged(true);
      setOldPassword('');
      setNewPassword1('');
      setNewPassword2('');
    } catch (error) {
      errors.absorb(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SettingsSection
        title="Change password"
        description="Your other sessions stay signed in until their refresh tokens expire."
        footer={
          <Button type="submit" disabled={saving}>
            {saving ? 'Changing…' : 'Change password'}
          </Button>
        }
      >
        {errors.formError && <FormAlert tone="error" message={errors.formError} />}
        {changed && <FormAlert tone="success" message="Password changed." />}

        <Field
          label="Current password"
          type="password"
          name="old_password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          error={errors.errorFor('old_password')}
          required
        />
        <Field
          label="New password"
          type="password"
          name="new_password1"
          autoComplete="new-password"
          value={newPassword1}
          onChange={(e) => setNewPassword1(e.target.value)}
          error={errors.errorFor('new_password1')}
          required
        />
        <Field
          label="Confirm new password"
          type="password"
          name="new_password2"
          autoComplete="new-password"
          value={newPassword2}
          onChange={(e) => setNewPassword2(e.target.value)}
          error={errors.errorFor('new_password2')}
          required
        />
      </SettingsSection>
    </form>
  );
}
