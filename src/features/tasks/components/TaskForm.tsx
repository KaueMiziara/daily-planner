import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Alert, ScrollView, Switch, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useTheme } from '@/theme/useTheme';
import type { Task } from '../db/schema';
import { taskInputSchema, type TaskFormInput, type TaskInput } from '../schemas';

type Props = {
  heading: string;
  initial?: Task;
  onSubmit: (input: TaskInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
};

const EMPTY: TaskFormInput = {
  title: '',
  description: null,
  startAt: null,
  endAt: null,
  allDay: false,
  estimateMinutes: null,
  recurrenceRule: null,
};

function toFormValues(task: Task): TaskFormInput {
  return {
    title: task.title,
    description: task.description,
    startAt: task.startAt,
    endAt: task.endAt,
    allDay: task.allDay,
    estimateMinutes: task.estimateMinutes,
    recurrenceRule: task.recurrenceRule,
  };
}

export function TaskForm({ heading, initial, onSubmit, onDelete, onClose }: Props) {
  const { colors, spacing } = useTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormInput, unknown, TaskInput>({
    resolver: zodResolver(taskInputSchema),
    defaultValues: initial ? toFormValues(initial) : EMPTY,
  });

  const allDay = useWatch({ control, name: 'allDay' });

  const confirmDelete = () =>
    Alert.alert('Delete task?', 'This will remove the task.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void onDelete?.() },
    ]);

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}
      >
        <Button title="Cancel" variant="ghost" onPress={onClose} />
        <AppText variant="heading">{heading}</AppText>
        <Button title="Save" onPress={handleSubmit(onSubmit)} disabled={isSubmitting} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      >
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              label="Title"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={errors.title?.message}
              placeholder="What needs to be done?"
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              label="Description"
              value={field.value ?? ''}
              onChangeText={(t) => field.onChange(t === '' ? null : t)}
              onBlur={field.onBlur}
              error={errors.description?.message}
              multiline
              style={{ minHeight: 80, textAlignVertical: 'top' }}
            />
          )}
        />

        <Controller
          control={control}
          name="allDay"
          render={({ field }) => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.md,
              }}
            >
              <AppText>All day</AppText>
              <Switch
                value={field.value}
                onValueChange={field.onChange}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>
          )}
        />

        <Controller
          control={control}
          name="startAt"
          render={({ field }) => (
            <DateTimeField
              label="Starts"
              value={field.value}
              onChange={field.onChange}
              allDay={allDay}
              error={errors.startAt?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="endAt"
          render={({ field }) => (
            <DateTimeField
              label="Due"
              value={field.value}
              onChange={field.onChange}
              allDay={allDay}
              error={errors.endAt?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="estimateMinutes"
          render={({ field }) => (
            <TextField
              label="Estimate (minutes)"
              value={field.value?.toString() ?? ''}
              onChangeText={(t) => {
                const n = parseInt(t.replace(/\D/g, ''), 10);
                field.onChange(Number.isNaN(n) ? null : n);
              }}
              onBlur={field.onBlur}
              error={errors.estimateMinutes?.message}
              keyboardType="number-pad"
              placeholder="e.g. 30"
            />
          )}
        />

        {onDelete ? <Button title="Delete task" variant="danger" onPress={confirmDelete} /> : null}
      </ScrollView>
    </Screen>
  );
}
