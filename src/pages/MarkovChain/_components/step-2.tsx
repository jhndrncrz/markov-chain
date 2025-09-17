import { Stack, Text, Table, NumberInput, Alert, Group, Badge } from "@mantine/core";
import { useMarkovChainFormContext } from "../_contexts/markov-chain-form-context";
import { IconInfoCircle, IconAlertTriangle } from "@tabler/icons-react";
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export function Step2() {
    const form = useMarkovChainFormContext();
    const stateLabels = form.values.states;
    const n = stateLabels.length;

    // Ensure transitionMatrix is always n x n
    if (form.values.transitionMatrix.length !== n) {
        form.setFieldValue('transitionMatrix', Array.from({ length: n }, () => Array(n).fill(0)));
    }

    // Calculate row sums and validate
    const rowSums = form.values.transitionMatrix.map(row =>
        row.reduce((sum, val) => sum + (val || 0), 0)
    );

    const hasInvalidRows = rowSums.some(sum => Math.abs(sum - 1) > 0.001);

    return (
        <Stack gap="md">
            <Text fw={500} size="lg">Step 2: Define Transition Probabilities</Text>

            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
                <Text size="sm" mb="xs">
                    <strong>Instructions:</strong> Enter the probability of transitioning from each state to every other state.
                </Text>
                <Text size="sm" mb="xs">
                    • <strong>Rows</strong> represent the current state (from)
                </Text>
                <Text size="sm" mb="xs">
                    • <strong>Columns</strong> represent the next state (to)
                </Text>
                <Text size="sm">
                    • Each row must sum to exactly 1.0 (all probabilities leaving a state)
                </Text>
            </Alert>

            {hasInvalidRows && (
                <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
                    <Text size="sm">
                        Some rows don't sum to 1.0. Each row must sum to exactly 1.0 to represent valid probabilities.
                    </Text>
                </Alert>
            )}

            <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th ta="center" bg="gray.1">
                            <Text fw={500} size="sm">From \ To</Text>
                        </Table.Th>
                        {stateLabels.map((label, colIdx) => (
                            <Table.Th key={colIdx} ta="center" bg="blue.1">
                                <Text fw={500} size="sm">
                                    <InlineMath math={label} />
                                </Text>
                            </Table.Th>
                        ))}
                        <Table.Th ta="center" bg="gray.1">
                            <Text fw={500} size="sm">Row Sum</Text>
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {stateLabels.map((rowLabel, rowIdx) => {
                        const rowSum = rowSums[rowIdx];
                        const isValidRow = Math.abs(rowSum - 1) <= 0.001;

                        return (
                            <Table.Tr key={rowIdx}>
                                <Table.Td ta="center" bg="blue.1">
                                    <Text fw={500} size="sm">
                                        <InlineMath math={rowLabel} />
                                    </Text>
                                </Table.Td>
                                {stateLabels.map((_, colIdx) => (
                                    <Table.Td key={colIdx} p="xs">
                                        <NumberInput
                                            w="100%"
                                            value={form.values.transitionMatrix[rowIdx]?.[colIdx] ?? 0}
                                            onChange={(value) => {
                                                const val = typeof value === 'number' ? value : 0;
                                                const matrix = form.values.transitionMatrix.map(row => [...row]);
                                                matrix[rowIdx][colIdx] = val;
                                                form.setFieldValue('transitionMatrix', matrix);
                                            }}
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            decimalScale={3}
                                            size="xs"
                                            styles={{
                                                input: {
                                                    textAlign: 'center',
                                                },
                                            }}
                                            aria-label={`Transition from ${rowLabel} to ${stateLabels[colIdx]}`}
                                        />
                                    </Table.Td>
                                ))}
                                <Table.Td ta="center">
                                    <Group justify="center" gap="xs">
                                        <Badge
                                            color={isValidRow ? "green" : "red"}
                                            variant="light"
                                            size="sm"
                                        >
                                            {rowSum.toFixed(3)}
                                        </Badge>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>

            <Text size="xs" c="dimmed" ta="center">
                Tip: You can use decimals like 0.5, 0.25, or 0.33 to represent probabilities
            </Text>
        </Stack>
    );
}