import { ExtensionContext, commands, window, ViewColumn, WebviewPanel } from 'vscode';
import { exec, ChildProcess, ExecException } from 'child_process';

const SCRCPY_COMMAND: string = 'scrcpy --no-audio --window-title VSCodeScrcpy';

function callbackExecComand (
  err: ExecException | null,
  stdout: string,
  stderr: string
): void {
  if (err) {
    console.error(`Erro ao executar o comando: ${err.message}`);
    if (err.code === 127) {
      console.error('Comando não encontrado. Verifique a instalação do comando.');
    }
    return;
  }

  if (stderr) {
    console.error(`Erro no comando: ${stderr}`);
    return;
  }

  console.log(`Saída do comando: ${stdout}`);
}

export function activate(context: ExtensionContext): void {
  const startScrcpy = commands.registerCommand('extension.startScrcpy', () => {
    const panel: WebviewPanel = window.createWebviewPanel(
      'scrcpy',
      'Scrcpy Viewer',
      ViewColumn.One,
      {
        retainContextWhenHidden: true,
        enableScripts: true,
      }
    );

    const scrcpyProcess: ChildProcess = exec(SCRCPY_COMMAND, callbackExecComand);

    scrcpyProcess.on('error', (err: Error) => {
      window.showErrorMessage(`Erro ao iniciar scrcpy: ${err.message}`);
    });

    scrcpyProcess.stdout?.on('data', (data: string) => {
      panel.webview.html = `
        <html>
          <body style="margin:0;padding:0;overflow:hidden;">
            <iframe
              src="data:text/html;charset=utf-8,${encodeURIComponent(data)}"
              style="
                width:100%;
                height:100%;
                border:none;
              "
            ></iframe>
          </body>
        </html>
      `;
    });

    scrcpyProcess.stderr?.on('data', (data: string) => {
      window.showErrorMessage(`Erro do scrcpy: ${data}`);
    });
  });

  context.subscriptions.push(startScrcpy);
}

export function deactivate(): void {}
