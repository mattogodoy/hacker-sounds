// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import player from './player';

let listener: EditorListener;
let extensionPos: number;
let isActive: boolean;
let isNotArrowKey: boolean;

export function activate(context: vscode.ExtensionContext) {
    console.log('Initializing "hacker-sounds" extension');

    // is the extension activated? yes by default.
    isActive = context.globalState.get('hacker_sounds', true);

    // to avoid multiple different instances
    listener = listener || new EditorListener(player);

    vscode.commands.registerCommand('hacker_sounds.enable', () => {
        if (!isActive) {
            context.globalState.update('hacker_sounds', true);
            isActive = true;
            vscode.window.showInformationMessage('Hacker Sounds extension enabled');
        } else {
            vscode.window.showWarningMessage('Hacker Sounds extension is already enabled');
        }
    });
    vscode.commands.registerCommand('hacker_sounds.disable', () => {
        if (isActive) {
            context.globalState.update('hacker_sounds', false);
            isActive = false;
            vscode.window.showInformationMessage('Hacker Sounds extension disabled');
        } else {
            vscode.window.showWarningMessage('Hacker Sounds extension is already disabled');
        }
    });

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(listener);
}

// this method is called when your extension is deactivated
export function deactivate() {}

/**
 * Listen to editor changes and play a sound when a key is pressed.
 */
export class EditorListener {
    private _disposable: vscode.Disposable;
    private _subscriptions: vscode.Disposable[] = [];
    private _basePath: string = path.join(__dirname, '..');

    // Audio files
    private _spaceAudio: string = path.join(this._basePath, 'audio', 'spacebar.wav');
    private _deleteAudio: string = path.join(this._basePath, 'audio', 'delete.wav');
    private _otherKeysAudio: string = path.join(this._basePath, 'audio', 'key.wav');
    private _cutAudio: string = path.join(this._basePath, 'audio', 'cut.wav');
    private _pasteAudio: string = path.join(this._basePath, 'audio', 'paste.wav');
    private _enterAudio: string = path.join(this._basePath, 'audio', 'enter.wav');
    private _tabAudio: string = path.join(this._basePath, 'audio', 'tab.wav');
    private _arrowsAudio: string = path.join(this._basePath, 'audio', 'arrow.wav');

    constructor(private player: any) {
        isNotArrowKey = false;

        vscode.workspace.onDidChangeTextDocument(this._keystrokeCallback, this, this._subscriptions);
        vscode.window.onDidChangeTextEditorSelection(this._arrowKeysCallback, this, this._subscriptions);
        this._disposable = vscode.Disposable.from(...this._subscriptions);
    }

    _keystrokeCallback(e: any) {
        if (!isActive){ return; }

        isNotArrowKey = true;
        let pressedKey = e.contentChanges[0].text;

        if (pressedKey === "") {
            if(e.contentChanges[0].rangeLength === 1){
                // backspace delete pressed
                player.play(this._deleteAudio);
            } else {
                // text cutted
                this.player.play(this._cutAudio);
            }
        } else if (pressedKey === " ") {
            // space pressed
            this.player.play(this._spaceAudio);
        } else if (pressedKey === "\n") {
            // space pressed
            this.player.play(this._enterAudio);
        } else if (pressedKey === "    " || pressedKey === "\t") {
            // space pressed
            this.player.play(this._tabAudio);
        } else {
            if(pressedKey.length === 1){
                // any other key pressed
                this.player.play(this._otherKeysAudio);
            } else {
                // text pasted
                this.player.play(this._pasteAudio);
            }
        }
    }

    _arrowKeysCallback(e: any){
        if (!isActive){ return; }

        // current editor
        const editor = vscode.window.activeTextEditor;

        // check if there is no selection
        if (editor && editor.selection.isEmpty && isNotArrowKey === false) {
            player.play(this._arrowsAudio);
        } else {
            isNotArrowKey = false;
        }
    }

    dispose() {
        this._disposable.dispose();
    }
}
