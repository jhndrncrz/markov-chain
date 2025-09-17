import { Button, Group, Stack, ActionIcon, Text, Alert } from "@mantine/core";
import { useMarkovChainFormContext } from "../_contexts/markov-chain-form-context";
import { TextInput } from "@mantine/core";
import { IconTrash, IconInfoCircle, IconAlertTriangle } from "@tabler/icons-react";

export function Step1() {
    const form = useMarkovChainFormContext();

    const stateNames = form.values.states;
    const hasEmpty = stateNames.some((name) => !name.trim());
    const duplicates = stateNames.filter((name, idx) => name && stateNames.indexOf(name) !== idx);
    const hasDuplicates = duplicates.length > 0;

    function getNextStateName(existing: string[]): string {
        const toLetters = (num: number) => {
            let str = '';
            while (num >= 0) {
                str = String.fromCharCode((num % 26) + 65) + str;
                num = Math.floor(num / 26) - 1;
            }
            return str;
        };
        let i = 0;
        let name = toLetters(i);
        const used = new Set(existing);
        while (used.has(name)) {
            i++;
            name = toLetters(i);
        }
        return name;
    }

    const stateInputs = stateNames.map((_, index) => (
        <Group justify="center" align="center" key={index}>
            <TextInput
                {...form.getInputProps(`states.${index}`)}
                placeholder={`State ${index + 1}`}
                flex={1}
                error={
                    !stateNames[index].trim()
                        ? 'State name cannot be empty'
                        : (duplicates.includes(stateNames[index]) ? 'Duplicate state name' : undefined)
                }
            />
            <ActionIcon size="lg" color="red" onClick={() => form.removeListItem('states', index)}>
                <IconTrash />
            </ActionIcon>
        </Group>
    ));

    return (
        <Stack gap="md">
            <Text fw={500} size="lg">Step 1: Define your Markov Chain states</Text>

            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                <Text size="sm" mb="xs">
                    <strong>Instructions:</strong> Enter a unique name for each state in your Markov Chain.
                </Text>
                <Text size="sm" mb="xs">
                    • Default names follow A, B, ..., Z, AA, AB, etc. but you can edit them as needed
                </Text>
                <Text size="sm" mb="xs">
                    • Each state must have a unique, non-empty name
                </Text>
                <Text size="sm">
                    • At least one state is required to proceed
                </Text>
            </Alert>

            {(hasEmpty || hasDuplicates) && (
                <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
                    <Text size="sm">
                        {hasEmpty && 'Please fill in all state names. '}
                        {hasDuplicates && 'State names must be unique.'}
                    </Text>
                </Alert>
            )}

            {stateInputs.length > 0
                ? stateInputs
                : (
                    <Text ta="center" c="dimmed" size="sm">
                        No states defined. Please add at least one state.
                    </Text>
                )
            }

            <Button
                mt="md"
                onClick={() => form.insertListItem('states', getNextStateName(stateNames))}
                disabled={hasEmpty}
                aria-label="Add a new state"
            >
                Add State
            </Button>
        </Stack>
    );
}