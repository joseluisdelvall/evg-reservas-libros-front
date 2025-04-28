import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalOptions } from './models/modal-options';

@Component({
  selector: 'app-modal-content',
  templateUrl: './modal-content.component.html',
  styleUrls: ['./modal-content.component.css']
})
export class ModalContentComponent implements OnInit {

  @Input() options!: ModalOptions;
  @Output() okButtonClicked = new EventEmitter<void>();
  @Output() cancelButtonClicked = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  onOkButtonClick(): void {
    this.okButtonClicked.emit();
  }

  onCancelButtonClick(): void {
    this.cancelButtonClicked.emit();
  }

}