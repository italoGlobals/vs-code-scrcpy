import { ExtensionContext, commands, window, ViewColumn } from 'vscode';
import { exec } from 'child_process';

export function activate(context: ExtensionContext): void {
  const startScrcpy = commands.registerCommand('extension.startScrcpy', () => {
    const panel = window.createWebviewPanel(
      'scrcpy',
      'Scrcpy Viewer',
      ViewColumn.One,
      {
        retainContextWhenHidden: true,
        enableScripts: true,
      }
    );

    const scrcpyProcess = exec('scrcpy --no-audio --window-title VSCodeScrcpy');

    scrcpyProcess.on('error', (err) => {
      window.showErrorMessage(`Erro ao iniciar scrcpy: ${err.message}`);
    });

    scrcpyProcess.stdout?.on('data', (data) => {
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

    scrcpyProcess.stderr?.on('data', (data) => {
      window.showErrorMessage(`Erro do scrcpy: ${data}`);
    });
  });

  context.subscriptions.push(startScrcpy);
}

export function deactivate() {}
