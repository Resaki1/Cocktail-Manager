import { Formik } from 'formik';
import { Garnish } from '@prisma/client';
import { useRouter } from 'next/router';
import React from 'react';
import { SingleFormLayout } from '../layout/SingleFormLayout';
import { UploadDropZone } from '../UploadDropZone';
import { convertToBase64 } from '../../lib/Base64Converter';
import { FaTrashAlt } from 'react-icons/fa';
import { alertService } from '../../lib/alertService';

interface GarnishFormProps {
  garnish?: Garnish;
}

export function GarnishForm(props: GarnishFormProps) {
  const router = useRouter();

  return (
    <Formik
      initialValues={{
        name: props.garnish?.name ?? '',
        price: props.garnish?.price ?? 0,
        description: props.garnish?.description ?? '',
        image: props.garnish?.image ?? undefined,
      }}
      onSubmit={async (values) => {
        try {
          const body = {
            id: props.garnish == undefined ? undefined : props.garnish.id,
            name: values.name,
            price: values.price,
            description: values.description?.trim() == '' ? null : values.description?.trim(),
            image: values.image == '' ? null : values.image,
          };
          const result = await fetch('/api/garnishes', {
            method: props.garnish == undefined ? 'POST' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (result.status.toString().startsWith('2')) {
            await router.push('/manage/garnishes');
          } else {
            console.error(result.status + ' ' + result.statusText);
          }
        } catch (error) {
          console.error(error);
        }
      }}
      validate={(values) => {
        const errors: any = {};
        if (!values.name) {
          errors.name = 'Required';
        }
        if (values.price.toString() == '' || isNaN(values.price)) {
          errors.price = 'Required';
        }
        return errors;
      }}
    >
      {({ values, setFieldValue, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <form onSubmit={handleSubmit}>
          <SingleFormLayout title={'Garnitur erfassen'}>
            <div className={'form-control'}>
              <label className={'label'}>
                <span className={'label-text'}>Name</span>
                <span className={'label-text-alt text-error space-x-2'}>
                  <span>{errors.name && touched.name && errors.name}</span>
                  <span>*</span>
                </span>
              </label>
              <input
                type={'text'}
                placeholder={'Name'}
                className={`input input-bordered ${errors.name && touched.name && 'input-error'} w-full`}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
                name={'name'}
              />
            </div>

            <div className={'form-control'}>
              <label className={'label'}>
                <span className={'label-text'}>Zubereitungsbeschreibung</span>
                <span className={'label-text-alt text-error space-x-2'}>
                  <span>{errors.description && touched.description && errors.description}</span>
                </span>
              </label>
              <textarea
                className={`textarea textarea-bordered ${
                  errors.description && touched.description && 'textarea-error'
                } w-full`}
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                name={'description'}
              />
            </div>

            <div className={'form-control'}>
              <label className={'label'}>
                <span className={'label-text'}>Preis</span>
                <span className={'label-text-alt text-error space-x-2'}>
                  <span>{errors.price && touched.price && errors.price}</span>
                  <span>*</span>
                </span>
              </label>
              <div className={'input-group'}>
                <input
                  type={'number'}
                  placeholder={'Preis'}
                  className={`input input-bordered ${errors.price && touched.price && 'input-error'} w-full`}
                  value={values.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  name={'price'}
                />
                <span className={'btn-secondary'}>€</span>
              </div>
            </div>
            <div className={'col-span-2'}>
              {values.image != undefined ? (
                <label className={'label'}>
                  <span className={'label-text'}>Zutaten Bild</span>
                </label>
              ) : (
                <></>
              )}
              {values.image == undefined ? (
                <UploadDropZone
                  onSelectedFilesChanged={async (file) => {
                    if (file != undefined) {
                      setFieldValue('image', await convertToBase64(file));
                    } else {
                      alertService.error('Datei konnte nicht ausgewählt werden.');
                    }
                  }}
                />
              ) : (
                <div className={'relative'}>
                  <div
                    className={'absolute top-2 right-2 btn-error btn btn-outline btn-sm btn-square'}
                    onClick={() => setFieldValue('image', undefined)}
                  >
                    <FaTrashAlt />
                  </div>
                  <img className={'rounded-lg h-32'} src={values.image} alt={'Cocktail Image'} />
                </div>
              )}
            </div>
            <div className={'form-control'}>
              <button type={'submit'} className={`btn btn-primary ${isSubmitting ?? 'loading'}`}>
                Speichern
              </button>
            </div>
          </SingleFormLayout>
        </form>
      )}
    </Formik>
  );
}