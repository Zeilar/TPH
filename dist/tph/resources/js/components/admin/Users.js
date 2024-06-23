import { CrudModal, CrudField, CrudTags, CrudSuspend } from './';
import React, { useState, useContext, useEffect } from 'react';
import { errorCodeHandler } from '../../functions/helpers';
import { mdiPencil, mdiPlus, mdiTrashCan } from '@mdi/js';
import { FeedbackModalContext } from '../../contexts';
import { MaterialTable } from '../misc';
import { Http } from '../../classes';
import classnames from 'classnames';
import Icon from '@mdi/react';

export default function Users() {
    document.title = 'TPH | Admin - Users';

    const { setMessage, setType } = useContext(FeedbackModalContext);

    const [modalTarget, setModalTarget] = useState();

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const [editModalFields, setEditModalFields] = useState([
        { title: 'Username', name: 'username', value: '' },
        { title: 'Email', name: 'email', value: '' },
        { title: 'Roles', name: 'roles', value: '' },
        { title: 'Suspend', name: 'suspend', value: false },
    ]);

    const [users, setUsers] = useState([]);

    useEffect(async () => {
        const { data, code } = await Http.get('admin/users');
        if (code === 200) {
            setUsers(data);
        } else {
            setMessage('Something went wrong fetching users');
        }
    }, []);

    async function deleteUser(id) {
        const { code } = await Http.delete(`admin/users/${id}`);
        errorCodeHandler(code, message => setMessage(message), () => setUsers(p => p.filter(user => user.id !== id)));
    }

    async function addUser(fields, setSubmitting) {
        const formData = new FormData();
        fields.forEach(field => {
            if (typeof field.value !== 'string') {
                formData.append(field.name, JSON.stringify(field.value));
            } else {
                formData.append(field.name, field.value);
            }
        });
        setSubmitting(true);
        const { code } = await Http.post('admin/users', { body: formData });
        setSubmitting(false);
        errorCodeHandler(code, message => setMessage(message), () => {
            setType('success');
            setMessage('Successfully created user');
            setUsers(p => {
                const username = fields.find(field => field.title === 'Username');
                const email = fields.find(field => field.title === 'Email');
                const roles = fields.find(field => field.title === 'Roles');
                return [...p, {
                    username: username.value,
                    email: email.value,
                    roles: roles.value,
                }];
            });
            setAddModalOpen(false);
        });
    }

    async function updateUser(fields, setSubmitting) {
        const formData = new FormData();
        fields.forEach(field => {
            if (typeof field.value !== 'string') {
                formData.append(field.name, JSON.stringify(field.value));
            } else {
                formData.append(field.name, field.value);
            }
        });
        setSubmitting(true);
        const { code } = await Http.post(`admin/users/${modalTarget.id}`, { body: formData });
        setSubmitting(false);
        errorCodeHandler(code, message => setMessage(message), () => {
            setType('success');
            setMessage('Successfully updated user');
            setUsers(p => p.map(user => {
                if (user.id === modalTarget.id) {
                    const username = fields.find(field => field.title === 'Username');
                    const email = fields.find(field => field.title === 'Email');
                    const roles = fields.find(field => field.title === 'Roles');
                    const suspended = fields.find(field => field.title === 'Suspend');
                    return {
                        ...user,
                        username: username.value,
                        email: email.value,
                        roles: roles.value,
                        suspended: suspended.value || false,
                    };
                }
                return user;
            }));
        });
    }

    return (
        <div>
            <MaterialTable
                columns={[
                    { title: 'Username', field: 'username' },
                    { title: 'Email', field: 'email' },
                ]}
                options={{
                    pageSize: 10,
                }}
                data={users}
                actions={[
                    {
                        icon: () => <Icon path={mdiPlus} />,
                        tooltip: 'Add user',
                        onClick: () => {
                            setAddModalOpen(true);
                        },
                        isFreeAction: true,
                    },
                    {
                        icon: () => <Icon path={mdiPencil} />,
                        tooltip: 'Edit user',
                        onClick: (e, rowData) => {
                            const parsedTags = rowData.roles.map(role => ({ value: role.name }));
                            setEditModalFields([
                                { title: 'Username', name: 'username', value: rowData.username },
                                { title: 'Email', name: 'email', value: rowData.email },
                                { title: 'Roles', name: 'roles', value: parsedTags },
                                { title: 'Suspend', name: 'suspend', value: rowData.suspended },
                            ]);
                            setModalTarget(rowData);
                            setEditModalOpen(true);
                        },
                    },
                    {
                        icon: () => <Icon className={classnames('color-danger')} path={mdiTrashCan} />,
                        tooltip: 'Delete user',
                        onClick: (e, rowData) => {
                            if (!confirm(`Are you sure you want to delete user ${rowData.username}? This can NOT be undone!`)) {
                                return;
                            }
                            deleteUser(rowData.id);
                        },
                    },
                ]}
                title="Users"
            />
            {
                editModalOpen &&
                    <CrudModal
                        close={() => setEditModalOpen(false)}
                        fields={editModalFields}
                        onSubmit={updateUser}
                        open={editModalOpen}
                        resource="user"
                        action="Edit"
                        render={(fields, updateField) => {
                            return (
                                <>
                                    <CrudField field={fields.find(field => field.title === 'Username')} updateField={updateField} placeholder="JohnSmith" autoFocus={true} />
                                    <CrudField field={fields.find(field => field.title === 'Email')} updateField={updateField} type="email" placeholder="user@example.net" autoComplete="off" />
                                    <CrudTags field={fields.find(field => field.title === 'Roles')} updateField={updateField} placeholder="member" />
                                    <CrudSuspend field={fields.find(field => field.title === 'Suspend')} updateField={updateField} />
                                </>
                            );
                        }}
                    />
            }
            {
                addModalOpen &&
                    <CrudModal
                        close={() => setAddModalOpen(false)}
                        open={addModalOpen}
                        onSubmit={addUser}
                        resource="user"
                        action="Add"
                        fields={[
                            { title: 'Username', name: 'username', value: '' },
                            { title: 'Email', name: 'email', value: '' },
                            { title: 'Password', name: 'password', value: '' },
                            { title: 'Password Confirmation', name: 'password_confirmation', value: '' },
                            { title: 'Roles', name: 'roles', value: 'member' },
                        ]}
                        render={(fields, updateField) => {
                            return (
                                <>
                                    <CrudField field={fields.find(field => field.title === 'Username')} updateField={updateField} autoFocus={true} />
                                    <CrudField field={fields.find(field => field.title === 'Email')} updateField={updateField} autoComplete="off" />
                                    <CrudField field={fields.find(field => field.title === 'Password')} updateField={updateField} type="password" />
                                    <CrudField field={fields.find(field => field.title === 'Password Confirmation')} updateField={updateField} type="password" />
                                    <CrudTags field={fields.find(field => field.title === 'Roles')} updateField={updateField} placeholder="member" />
                                </>
                            );
                        }}
                    />
            }
        </div>
    );
}
