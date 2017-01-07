define(function(require) {

    var $ = require('jquery'),
        common = require('utils/common'),
        Protoplast = require('p'),
        cm = require('libs/codemirror/lib/codemirror'),
        EditorViewPresenter = require('plugin/editor/view/editor-view-presenter'),
        HandlebarComponent = require('utils/handlebar-component'),
        SectionViewMixin = require('aw-bubble/view/section-view-mixin');

    require('libs/codemirror/addon/selection/active-line');
    require('libs/codemirror/addon/hint/show-hint');
    require('libs/codemirror/addon/hint/anyword-hint');
    require('utils/fountain/cmmode');

    return HandlebarComponent.extend([SectionViewMixin], {

        $meta: {
            presenter: EditorViewPresenter
        },

        hbs: '<textarea id="editor-textarea" placeholder=""></textarea>',
        
        content: '',
        
        saveInProgress: false,
        
        pendingChanges: false,
        
        isSyncEnabled: false,
        
        isAutoSaveEnabled: false,
        
        syncAvailable: false,
        
        autoSaveAvailable: false,

        syncOnIcon: 'gfx/icons/other/sync.svg',
        
        syncOffIcon: 'gfx/icons/other/no-sync.svg',

        init: function() {
            Protoplast.utils.bind(this, {
                isSyncEnabled: this._updateSync,
                isAutoSaveEnabled: this._updateAutoSave,
                syncAvailable: [this._updateSyncAvailability, this._updateSync],
                autoSaveAvailable: [this._updateAutoSaveAvailability, this._updateAutoSave],
                saveInProgress: this._updateAnimation,
                pendingChanges: this._updateAnimation,
                content: this._updateContent,
            });

        },

        createEditor: function() {
            var editor = cm.fromTextArea($('#editor-textarea').get(0), {
                mode: "fountain",
                lineNumbers: false,
                lineWrapping: true,
                styleActiveLine: true,
                extraKeys: {
                    "Ctrl-Space": "autocomplete"
                }
            });

            return editor;
        },
        
        refresh: function() {
            this.editor.focus();
            this.editor.refresh();
        },
        
        setCursor: function(position) {
            this.editor.setCursor(position);
        },
        
        scrollTo: function(left, top) {
            this.editor.scrollTo(left, top);
        },
        
        getScrollInfo: function() {
            return this.editor.getScrollInfo()
        },
        
        getDefaultTextHeight: function() {
            return this.editor.defaultTextHeight();
        },
        
        _updateContent: function() {
            if (this.editor && this.content !== this.getEditorContent()) {
                this.editor.setValue(this.content);
            }
        },

        _updateSync: function() {
            $('.auto-reload-icon')
                .attr('src', this.isSyncEnabled ? this.syncOnIcon : this.syncOffIcon)
                .attr('title', this.isSyncEnabled ? 'Turn auto-reload off' : 'Turn auto-reload on');
            $('.CodeMirror').css('opacity', this.isSyncEnabled ? 0.5 : 1);
        },

        _updateAutoSave: function() {
            $('.auto-save-icon')
                .attr('src', this.isAutoSaveEnabled ? this.syncOnIcon : this.syncOffIcon)
                .attr('title', this.isAutoSaveEnabled ? 'Turn auto-save off' : 'Turn auto-save on');
        },
        
        _updateSyncAvailability: function() {
            if (this.syncAvailable) {
                $('a[action="sync-fountain"]').parent().show();
            }
            else {
                $('a[action="sync-fountain"]').parent().hide();
            }
        },
        
        _updateAutoSaveAvailability: function() {
            if (this.autoSaveAvailable) {
                $('a[action="auto-save"]').parent().show();
            }
            else {
                $('a[action="auto-save"]').parent().hide();
            }
        },

        _updateAnimation: function() {
            if (this.isAutoSaveEnabled) {
                if (this.pendingChanges || this.saveInProgress) {
                    $('.auto-save-icon').addClass('in-progress');
                }
                else {
                    $('.auto-save-icon').removeClass('in-progress');
                }

                if (this.saveInProgress) {
                    $('.auto-save-icon').addClass('rotate');
                }
                else {
                    $('.auto-save-icon').removeClass('rotate');
                }
            }
            else {
                $('.auto-save-icon').removeClass('rotate').removeClass('in-progress');
            }
        },
        
        getEditorContent: function() {
            return this.editor.getValue();
        },

        addInteractions: function() {
            this.editor = this.createEditor();
            this.editor.setValue(this.content);

            this.editor.on('change', function () {
                this.dispatch('editorContentChanged');
            }.bind(this));
            
            $('a[action="sync-fountain"]').click(function() {
                if (this.isSyncEnabled) {
                    this.fire('disableSync');
                }
                else {
                    this.fire('enableSync');
                }
            });

            $('a[action="auto-save"]').click(function() {
                this.fire('toggleAutoSave');
            });
            
            var resize = function() {
                this.editor.setSize("auto", $(this.root.parentNode).height() - 70);
                this.editor.refresh();
            }.bind(this);

            resize();
            $(window).resize(resize);
        }
    });
});

