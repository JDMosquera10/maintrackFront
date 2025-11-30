import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { CreateStateRequest } from '../../../../shared/models/state.model';

@Component({
  selector: 'app-state-modal',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './state-modal.component.html',
  styleUrl: './state-modal.component.scss'
})
export class StateModalComponent {
  stateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<StateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.stateForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      isActive: [true, Validators.required]
    });

    if (this.data.type === 'edit' || this.data.type === 'errorAdd') {
      this.stateForm.patchValue({
        name: this.data.element.name,
        description: this.data.element.description,
        isActive: this.data.element.isActive
      });
    }
  }

  submit() {
    if (this.stateForm.valid) {
      const formValue = this.stateForm.value;
      const state: CreateStateRequest = {
        name: formValue.name,
        description: formValue.description,
        isActive: formValue.isActive
      };
      this.dialogRef.close(state);
    } else {
      this.stateForm.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}

