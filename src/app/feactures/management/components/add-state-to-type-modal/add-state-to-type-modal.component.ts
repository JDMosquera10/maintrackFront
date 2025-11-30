import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeneralModule } from '../../../../modules/general.module';
import { State } from '../../../../shared/models/state.model';

@Component({
  selector: 'app-add-state-to-type-modal',
  standalone: true,
  imports: [GeneralModule],
  templateUrl: './add-state-to-type-modal.component.html',
  styleUrl: './add-state-to-type-modal.component.scss'
})
export class AddStateToTypeModalComponent {
  addStateForm: FormGroup;
  availableStates: State[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddStateToTypeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.availableStates = data.availableStates || [];
    
    this.addStateForm = this.fb.group({
      stateId: ['', Validators.required],
      order: [data.nextOrder || 1, [Validators.required, Validators.min(1)]]
    });
  }

  submit() {
    if (this.addStateForm.valid) {
      this.dialogRef.close(this.addStateForm.value);
    } else {
      this.addStateForm.markAllAsTouched();
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}

