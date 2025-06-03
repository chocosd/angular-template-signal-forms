import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@builder/builder/form-builder';
import { FormFieldType } from '@enums/form-field-type.enum';
import { ArrayFormContainer } from '@models/signal-form.model';
import { SignalFormFieldsComponent } from '@renderers/signal-form-fields/signal-form-fields.component';
import { SignalFormSaveButtonComponent } from '@renderers/signal-form-save-button/signal-form-save-button.component';
import {
  CheckCircle,
  ClipboardList,
  LucideAngularModule,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-angular';
import {
  defaultContact,
  defaultContactList,
  type Contact,
} from '../models/contacts.model';

@Component({
  selector: 'app-example-contacts-array',
  standalone: true,
  imports: [
    CommonModule,
    SignalFormFieldsComponent,
    SignalFormSaveButtonComponent,
    LucideAngularModule,
  ],
  templateUrl: './example-contacts-array.component.html',
  styleUrl: './example-contacts-array.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleContactsArrayComponent implements OnInit {
  public contactForms!: ArrayFormContainer<Contact>;
  public contactData: Contact[] = [...defaultContactList.contacts];

  // Lucide icons
  public readonly PlusIcon = Plus;
  public readonly CheckCircleIcon = CheckCircle;
  public readonly ClipboardListIcon = ClipboardList;
  public readonly Trash2Icon = Trash2;
  public readonly SaveIcon = Save;
  public readonly RotateCcwIcon = RotateCcw;

  public ngOnInit(): void {
    this.contactForms = FormBuilder.createFormFromArray<Contact>({
      title: 'Contacts Manager',
      model: this.contactData,
      defaultItem: defaultContact,
      fields: [
        {
          name: 'name',
          label: 'Full Name',
          type: FormFieldType.TEXT,
          validators: [
            (value: string) => (!value ? 'Name is required' : null),
            (value: string) =>
              value && value.length < 2
                ? 'Name must be at least 2 characters'
                : null,
          ],
        },
        {
          name: 'email',
          label: 'Email Address',
          type: FormFieldType.TEXT,
          validators: [
            (value: string) => (!value ? 'Email is required' : null),
            (value: string) =>
              value && !value.includes('@')
                ? 'Please enter a valid email'
                : null,
          ],
        },
        {
          name: 'phone',
          label: 'Phone Number',
          type: FormFieldType.TEXT,
          validators: [
            (value: string) => (!value ? 'Phone number is required' : null),
          ],
        },
        {
          name: 'age',
          label: 'Age',
          type: FormFieldType.NUMBER,
          validators: [
            (value: number) => (!value ? 'Age is required' : null),
            (value: number) =>
              value && (value < 0 || value > 120)
                ? 'Please enter a valid age'
                : null,
          ],
        },
        {
          name: 'isEmergencyContact',
          label: 'Emergency Contact',
          type: FormFieldType.SWITCH,
        },
        {
          name: 'city',
          label: 'City',
          type: FormFieldType.TEXT,
        },
        {
          name: 'country',
          label: 'Country',
          type: FormFieldType.TEXT,
        },
        {
          name: 'tags',
          label: 'Tags',
          type: FormFieldType.CHIPLIST,
          config: {
            placeholder: 'Select tags...',
          },
          options: [
            { label: 'Family', value: 'family' },
            { label: 'Friend', value: 'friend' },
            { label: 'Work', value: 'work' },
            { label: 'Emergency', value: 'emergency' },
            { label: 'Doctor', value: 'doctor' },
            { label: 'Neighbor', value: 'neighbor' },
          ],
        },
      ],
      onSave: (contacts: Contact[]) => {
        console.log('Saving contacts:', contacts);
        this.contactData = contacts;
        alert(`Successfully saved ${contacts.length} contacts!`);
      },
      onItemAdd: (contact: Contact) => {
        console.log('Added new contact:', contact);
      },
      onItemRemove: (index: number) => {
        console.log('Removed contact at index:', index);
      },
    });
  }

  public addNewContact(): void {
    this.contactForms.addItem({
      ...defaultContact,
      id: Date.now().toString(), // Generate a simple ID
    });
  }

  public removeContact(index: number): void {
    if (confirm('Are you sure you want to remove this contact?')) {
      this.contactForms.removeItem(index);
    }
  }

  public validateAllContacts(): void {
    const isValid = this.contactForms.validateAll();
    if (isValid) {
      alert('All contacts are valid!');
    } else {
      alert('Some contacts have validation errors. Please check and fix them.');
    }
  }

  public getCurrentValues(): void {
    const values = this.contactForms.value();
    console.log('Current form values:', values);
    alert(`Current values logged to console. Total contacts: ${values.length}`);
  }
}
