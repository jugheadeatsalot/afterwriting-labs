define(function(require) {

    var Protoplast = require('p'),
        save = require('utils/save'),
        EditorModel = require('plugin/editor/model/editor-model');

    var EditorController = Protoplast.Object.extend({
        
        editorModel: {
            inject: EditorModel
        },
        
        autoSaveSyncTimer: null,
        
        toggleAutoSave: function() {
            if (!this.editorModel.isAutoSaveEnabled && this.editorModel.isSyncEnabled) {
                this.editorModel.toggleSync();
            }
            this.setAutoSave(!this.editorModel.isAutoSaveEnabled);
        },
        
        setAutoSave: function(value) {
            this.editorModel.isAutoSaveEnabled = value;
            if (this.editorModel.isAutoSaveEnabled && !this.autoSaveSyncTimer) {
                this.editorModel.pendingChanges = true; // trigger first save
                this.editorModel.saveInProgress = false;
                this.autoSaveSyncTimer = setInterval(this.saveCurrentScript, 3000);
                this.saveCurrentScript();
            }
            else {
                clearInterval(this.autoSaveSyncTimer);
                this.autoSaveSyncTimer = null;
                this.editorModel.pendingChanges = false; 
                this.editorModel.saveInProgress = false;
            }
        },
        
        saveCurrentScript: function() {
            if (!this.editorModel.saveInProgress && this.editorModel.pendingChanges) {
                this.editorModel.pendingChanges = false;
                this.editorModel.saveInProgress = true;
                save.save_current_script(function(){
                    this.editorModel.saveInProgress = false;
                }.bind(this));
            }
        }
        
    });

    return EditorController;
});