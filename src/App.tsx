import "@mantine/core/styles.css";
import { AppShell, MantineProvider, Stack } from "@mantine/core";
import { theme } from "./theme";
import { MarkovChain } from "./pages/MarkovChain/markov-chain";

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <AppShell>
        <AppShell.Main>
          <Stack align="center" justify="center" mih="100vh">
            <MarkovChain />
          </Stack>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}
