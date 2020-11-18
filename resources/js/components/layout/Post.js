import { FeedbackModalContext } from '../../contexts/FeedbackModalContext';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { humanReadableDate, ucfirst } from '../../functions/helpers';
import { errorCodeHandler } from '../../functions/helpers';
import { UserContext } from '../../contexts/UserContext';
import MdEditor from 'react-markdown-editor-lite';
import { mdiLoading, mdiThumbUp } from '@mdi/js';
import { createUseStyles } from 'react-jss';
import { NavLink } from 'react-router-dom';
import Http from '../../classes/Http';
import classnames from 'classnames';
import Icon from '@mdi/react';
import marked from 'marked';

export default function Post({ post, refetch, quote }) {
    const styles = createUseStyles({
        post: {
            boxShadow: [0, 0, 3, 0, 'rgba(0, 0, 0, 0.15)'],
            border: '1px solid var(--border-primary)',
            backgroundColor: 'var(--color-primary)',
            transition: 'all 0.35s linear',
            borderRadius: 3,
            '&:last-child': {
                marginBottom: 0,
            },
            '&.removed': {
                opacity: 0,
            },
            '&.isOp': {
                boxShadow: [0, 0, 5, 0, 'var(--color-main)'],
                borderColor: 'var(--color-main)',
                '& .triangle': {
                    boxShadow: [0, 0, 5, 0, 'var(--color-main)'],
                    borderColor: 'var(--color-main)',
                },
            },
            '&.isAuthor': {
                boxShadow: [0, 0, 5, 0, 'var(--color-dark)'],
                borderColor: 'var(--color-dark)',
                '& .triangle': {
                    boxShadow: [0, 0, 5, 0, 'var(--color-dark)'],
                    borderColor: 'var(--color-dark)',
                },
            },
        },
        triangle: {
            borderBottom: '1px solid var(--border-primary)',
            borderLeft: '1px solid var(--border-primary)',
            transform: 'translateX(-50%) rotate(45deg)',
            backgroundColor: 'inherit',
            content: '""',
            height: 25,
            width: 25,
            left: -1,
            top: 25,
        },
        avatar: {
            height: 50,
            width: 50,
            left: -80,
            top: 10,
        },
        user: {
            backgroundColor: 'var(--color-primary)',
            color: 'var(--text-primary)',
            alignSelf: 'center',
            zIndex: 100,
            '&:hover': {
                textDecoration: 'none',
            },
        },
        head: {
            borderBottom: '1px solid var(--border-primary)',
        },
        footer: {
            borderTop: '1px solid var(--border-primary)',
            gap: '10px',
        },
        metaboxes: {
            fontFamily: 'Montserrat',
            alignItems: 'center',
        },
        metabox: {
            borderLeft: '1px solid var(--border-primary)',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            padding: [20, 30],
            display: 'flex',
            height: '100%',
        },
        metaboxHeader: {
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            marginBottom: 5,
        },
        metaboxValue: {
            fontWeight: 'bold',
        },
        likeIcon: {
            marginRight: 3,
            width: 15,
        },
        likesAmount: {
            marginRight: 3,
        },
        loadingIcon: {
            width: 15,
        },
        editorError: {
            color: 'var(--color-danger)',
        },
        editedByInput: {
            borderTop: '1px solid var(--border-primary)',
        },
        editedByLabel: {
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
        },
        editedByMessage: {
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
        },
        postedAt: {
            fontFamily: 'Montserrat',
            fontSize: '0.85rem',
        },
        role: {
            fontSize: '1rem',
        },
        signature: {
            marginBottom: '5px !important',
            color: 'var(--text-secondary)',
            marginTop: '10px !important',
            fontFamily: 'Montserrat',
            paddingTop: 15,
            '&::after': {
                backgroundColor: 'var(--text-secondary)',
                position: 'absolute',
                content: '""',
                width: 200,
                height: 1,
                left: 0,
                top: 0,
            },
        },
    });
    const classes = styles();

    const [editedByMessage, setEditedByMessage] = useState(post.edited_by_message);
    const [repuation, setRepuation] = useState(post.user.likesAmount);
    const [updatedAt, setUpdatedAt] = useState(post.updated_at);
    const [likes, setLikes] = useState(post.postlikes.length);
    const [editedBy, setEditedBy] = useState(post.edited_by);
    const [content, setContent] = useState(post.content);

    const [editedByInput, setEditedByInput] = useState('');
    const [editorError, setEditorError] = useState();
    const [hasLiked, setHasLiked] = useState(false);

    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [liking, setLiking] = useState(false);

    const { setMessage } = useContext(FeedbackModalContext);
    const { user } = useContext(UserContext);

    const postElement = useRef();

    const isAuthor = () => user.id === post.user.id;
    const canPost = () => user && !user.suspended;

    function canEdit() {
        if (!user || user.suspended) return false;
        if (user.roles[0].clearance <= 3) return true;
        if (isAuthor()) return true;
        return false;  
    }

    function canRemove() {
        if (!canEdit) return false;
        if (user.roles[0].clearance <= 2) return true;
        if (post.isFirst) return false;
        return isAuthor();
    }

    async function toggleLike() {
        const formData = new FormData();
        formData.append('hasLiked', hasLiked);
        setLiking(true);
        const response = await Http.put(`posts/${post.id}/toggleLike`);
        setLiking(false);
        errorCodeHandler(response.code, setMessage, () => {
            setRepuation(p => hasLiked ? p - 1 : p + 1);
            setLikes(p => hasLiked ? p - 1 : p + 1);
            setHasLiked(p => !p);
        });
    }

    async function deletePost() {
        if (!confirm('Are you sure you want to delete this post?')) return;
        setDeleting(true);
        const response = await Http.delete(`posts/${post.id}`);
        setDeleting(false);
        errorCodeHandler(response.code, setMessage, () => {
            postElement.current.classList.add('removed');
            refetch();
        });
    }

    async function updatePost(e) {
        e.preventDefault();
        const now = new Date();
        const formData = new FormData();
        formData.append('content', content);
        formData.append('editedByMessage', editedByInput);
        setUpdating(true);
        const response = await Http.post(`posts/${post.id}`, { body: formData });
        setUpdating(false);
        if (response.code === 422) {
            setEditorError(response.data.errors.content);
        } else {
            errorCodeHandler(response.code, setMessage, () => {
                setEditedByMessage(editedByInput);
                setEditedBy(user.username);
                setEditorError(null);
                setUpdatedAt(now);
                setEditing(false);
            });
        }
    }

    useEffect(() => {
        for (let i = 0; i < post.postlikes.length; i++) {
            if (post.postlikes[i].user_id === user.id) {
                setHasLiked(true);
                break;
            }
        }
    }, []);

    useEffect(() => {
        if (Number(window.location.hash.replace('#', '')) === post.id) {
            window.scrollTo(0, window.scrollY + postElement.current.getBoundingClientRect().top);
        }
    }, [window.location.hash]);

    window.addEventListener('beforeunload', function(e) {
        if (post.content !== content) e.returnValue = 'You have unsaved changes';
    });

    const likeButtonRender = () => {
        if (liking) return <Icon className={classnames(classes.likeIcon, 'mr-0')} path={mdiLoading} spin={1} />;
        if (hasLiked) {
            return <>
                <Icon className={classnames(classes.likeIcon)} path={mdiThumbUp} />
                <span className={classnames(classes.likesAmount)}>({likes})</span>
                <span>You liked this</span>
            </>;
        }
        return <>
            <span className={classnames(classes.likesAmount)}>({likes})</span>
            <span>Like this</span>
        </>;
    }

    const editButtonsRender = () => {
        if (!canEdit()) return false;
        if (editing) {
            return <>
                <button className={classnames('btn caps center-children')} onClick={updatePost}>
                    {updating ? <Icon className={classnames(classes.loadingIcon)} path={mdiLoading} spin={1} /> : <span>Save</span>}
                </button>
                <button className={classnames('btn btn-dark caps')} onClick={() => setEditing(false)}>Cancel</button>
            </>;
        }
        return <button className={classnames('btn btn-dark caps')} onClick={() => setEditing(true)}>Edit</button>;
    }

    return (
        <article className={classnames(classes.post, { isOp: post.isOp, isAuthor: isAuthor() }, 'col mb-3 relative')} ref={postElement}>
            <div className={classnames(classes.head, 'row')}>
                <img
                    className={classnames(classes.avatar, 'absolute round')}
                    src={`/storage/avatars/${post.user.avatar}`}
                    alt="Profile picture"
                />
                <h3 className={classnames(classes.user, 'col p-3')}>
                    <NavLink to={`/user/${post.user.username}`}>{post.user.username}</NavLink>
                    <p className={classnames(classes.role, 'ucfirst mt-1')}>{post.user.roles[0].name}</p>
                </h3>
                <aside className={classnames(classes.metaboxes, 'ml-auto d-flex')}>
                    <div className={classnames(classes.metabox)}>
                        <h4 className={classnames(classes.metaboxHeader)}>Forum Rank</h4>
                        <span className={classnames(classes.metaboxValue)}>{ucfirst(post.user.rank.name)}</span>
                    </div>
                    <div className={classnames(classes.metabox)}>
                        <h4 className={classnames(classes.metaboxHeader)}>Posts</h4>
                        <span className={classnames(classes.metaboxValue)}>{post.user.postsAmount}</span>
                    </div>
                    <div className={classnames(classes.metabox)}>
                        <h4 className={classnames(classes.metaboxHeader)}>Reputation</h4>
                        <span className={classnames(classes.metaboxValue)}>{repuation}</span>
                    </div>
                    <div className={classnames(classes.metabox)}>
                        <h4 className={classnames(classes.metaboxHeader)}>Registered</h4>
                        <span className={classnames(classes.metaboxValue)}>{humanReadableDate(post.user.created_at)}</span>
                    </div>
                </aside>
            </div>
            {
                editing
                    ? <MdEditor
                        style={{ height: '100%', minHeight: 250 }}
                        onChange={({ text }) => setContent(text)}
                        renderHTML={text => marked(text)}
                        view={{ menu: true, md: true }}
                        placeholder="Aa"
                        value={content}
                    />
                    : <div className={classnames(classes.body, 'p-3 custom-html-style')}>
                        <p className={classnames(classes.postedAt, 'bold mb-3')}>Posted {humanReadableDate(post.created_at).toLowerCase()}</p>
                        <p dangerouslySetInnerHTML={{ __html: marked(content) }} />
                        {
                            editedBy &&
                                <p className={classnames(classes.editedByMessage, 'italic mt-3')}>
                                    Edited by {editedBy} {humanReadableDate(updatedAt).toLowerCase()} "{editedByMessage}"
                                </p>
                        }
                        {
                            post.user.signature &&
                                <p className={classnames(classes.signature, 'relative bold')}>
                                    {post.user.signature}
                                </p>
                        }
                    </div>
            }
            {
                user &&
                    <>
                        {editing && editorError && <p className={classnames(classes.editorError, 'p-3 bold')}>{editorError}</p>}
                        {
                            editing &&
                                <form className={classnames(classes.editedByInput, 'p-3 col')} onSubmit={updatePost}>
                                    <label className={classnames(classes.editedByLabel, 'mb-3')}>
                                        Edit reason <span className={classnames('italic')}>(optional)</span>
                                    </label>
                                    <input value={editedByInput} onChange={e => setEditedByInput(e.target.value)} placeholder="Aa" />
                                </form>
                        }
                        <div className={classnames(classes.footer, 'row p-3')}>
                            {editButtonsRender()}
                            {
                                !isAuthor() &&
                                    <button
                                        className={classnames('btn', { 'btn-dark': !hasLiked, loading: liking })}
                                        onClick={toggleLike} disabled={liking}
                                    >
                                        <span className={classnames(classes.likeButton, 'center-children')}>{likeButtonRender()}</span>
                                    </button>
                            }
                            {canPost() && quote && <button className={classnames('btn btn-dark')} onClick={() => quote(post)}>Quote</button>}
                            {
                                canRemove() &&
                                    <button className={classnames('btn ml-auto btn-danger caps', { loading: deleting })} onClick={deletePost}>
                                        {deleting ? <Icon className={classnames(classes.loadingIcon)} path={mdiLoading} spin={1} /> : 'Delete'}
                                    </button>
                            }
                        </div>
                        <span className={classnames(classes.triangle, 'absolute triangle')} />
                    </>
            }
        </article>
    );
}
