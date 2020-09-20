import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular';
import * as Editor from '@ckeditor/ckeditor5-build-classic';
import { FormControl } from "@angular/forms";
@Component({
  selector: "hls-ckeditor",
  templateUrl: "./ckeditor.component.html",
  styleUrls: ["./ckeditor.component.scss"],
})
export class CKEditorComponent implements OnInit {

  @Input("data") data = "";
  @Input("toolbar") toolbar = true;
  @Output() change = new EventEmitter();
  @Input() ctrl: FormControl;
  public Editor = Editor;
  public config : any = {
    language: 'fr',
    fontColor: {
      colors: [
        { color: '#000000', label: 'Black'}, { color: '#696969', label: 'Dim grey'}, { color: '#808080', label: 'GREY'},
        { color: '#d3d3d3', label: 'Light grey'}, { color: '#ffffff', label: 'White', hasBorder: true}, { color: '#ff0000', label: 'Red'},
        { color: '#ffa500', label: 'Orange'}, { color: '#ffff00', label: 'Yellow'}, { color: '#90ee90', label: 'Light green'},
        { color: '#008000', label: 'Green'}, { color: '#7fffd4', label: 'Aquamarine'}, { color: '#40e0d0', label: 'Turquoise'},
        { color: '#add8e6', label: 'Light blue'}, { color: '#0000ff', label: 'Blue'}, { color: '#800080', label: 'Purple'},
      ]
    },
    fontBackgroundColor: {
      colors: [
        { color: '#000000', label: 'Black'}, { color: '#696969', label: 'Dim grey'}, { color: '#808080', label: 'GREY'},
        { color: '#d3d3d3', label: 'Light grey'}, { color: '#ffffff', label: 'White'}, { color: '#ff0000', label: 'Red'},
        { color: '#ffa500', label: 'Orange'}, { color: '#ffff00', label: 'Yellow'}, { color: '#90ee90', label: 'Light green'},
        { color: '#008000', label: 'Green'}, { color: '#7fffd4', label: 'Aquamarine'}, { color: '#40e0d0', label: 'Turquoise'},
        { color: '#add8e6', label: 'Light blue'}, { color: '#0000ff', label: 'Blue'}, { color: '#800080', label: 'Purple'},
      ]
    },
};
  constructor() {}

  ngOnInit(): void {
    if(this.toolbar == false){
      this.config = {
        language: 'fr',
        fontColor: {
          colors: [
            { color: '#000000', label: 'Blacko'}, { color: '#696969', label: 'Dim grey'}, { color: '#808080', label: 'GREY'},
            { color: '#d3d3d3', label: 'Light grey'}, { color: '#ffffff', label: 'White'}, { color: '#ff0000', label: 'Red'},
            { color: '#ffa500', label: 'Orange'}, { color: '#ffff00', label: 'Yellow'}, { color: '#90ee90', label: 'Light green'},
            { color: '#008000', label: 'Green'}, { color: '#7fffd4', label: 'Aquamarine'}, { color: '#40e0d0', label: 'Turquoise'},
            { color: '#add8e6', label: 'Light blue'}, { color: '#0000ff', label: 'Blue'}, { color: '#800080', label: 'Purple'},
          ]
        },
        fontBackgroundColor: {
          colors: [
            { color: '#000000', label: 'Black'}, { color: '#696969', label: 'Dim grey'}, { color: '#808080', label: 'GREY'},
            { color: '#d3d3d3', label: 'Light grey'}, { color: '#ffffff', label: 'White'}, { color: '#ff0000', label: 'Red'},
            { color: '#ffa500', label: 'Orange'}, { color: '#ffff00', label: 'Yellow'}, { color: '#90ee90', label: 'Light green'},
            { color: '#008000', label: 'Green'}, { color: '#7fffd4', label: 'Aquamarine'}, { color: '#40e0d0', label: 'Turquoise'},
            { color: '#add8e6', label: 'Light blue'}, { color: '#0000ff', label: 'Blue'}, { color: '#800080', label: 'Purple'},
          ]
        },
        toolbar: []
    };
    }
  }

  public onChange({ editor }: ChangeEvent) {
    const data = editor.getData();
    this.change.emit(data);
  }
}
