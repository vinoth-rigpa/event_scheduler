import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { DbService } from '../../../services/db/db.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfig } from '../../../config/appconfig';
@Component({
  selector: 'app-department-edit',
  templateUrl: './department-edit.page.html',
  styleUrls: ['./department-edit.page.scss'],
})
export class DepartmentEditPage implements OnInit {
  editForm: FormGroup;
  id: any;
  validation_messages = {
    dept_name: [{ type: 'required', message: 'Department name is required.' }],
    dept_password: [
      { type: 'required', message: 'Department password is required.' },
    ],
  };
  constructor(
    private db: DbService,
    private router: Router,
    public formBuilder: FormBuilder,
    private actRoute: ActivatedRoute
  ) {
    this.id = this.actRoute.snapshot.paramMap.get('id');
    this.db.getDepartment(this.id).then((res) => {
      this.editForm.setValue({
        dept_name: res['dept_name'],
        dept_password: res['dept_password'],
      });
    });
  }
  ngOnInit() {
    this.editForm = this.formBuilder.group({
      dept_name: new FormControl('', Validators.required),
      dept_password: new FormControl('', Validators.required),
    });
  }
  saveForm() {
    this.db.updateDepartment(this.id, this.editForm.value).then((res) => {
      console.log(res);
      this.router.navigate([`offline/department`], { replaceUrl: true });
    });
  }
  goBack() {
    this.router.navigate([`offline/department`], { replaceUrl: true });
  }
}
