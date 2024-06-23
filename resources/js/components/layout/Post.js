import {
    humanReadableDate,
    ucfirst,
    errorCodeHandler
} from "../../functions/helpers";
import React, { useState, useEffect, useRef, useContext } from "react";
import { FeedbackModalContext, UserContext } from "../../contexts";
import { mdiLoading, mdiThumbUp, mdiLinkVariant } from "@mdi/js";
import MdEditor from "react-markdown-editor-lite";
import { createUseStyles } from "react-jss";
import { NavLink } from "react-router-dom";
import { Http } from "../../classes";
import classnames from "classnames";
import Icon from "@mdi/react";
import marked from "marked";

export default function Post({
    thread,
    post,
    refetch,
    quote,
    controls = true,
    permalink = false
}) {
    const styles = createUseStyles({
        post: {
            boxShadow: [0, 0, 3, 0, "rgba(0, 0, 0, 0.15)"],
            border: "1px solid var(--border-primary)",
            backgroundColor: "var(--color-primary)",
            transition: "all 0.35s linear",
            borderRadius: 3,
            "&:last-child": {
                marginBottom: 0
            },
            "&.removed": {
                opacity: 0
            },
            "&.isOp": {
                boxShadow: [0, 0, 5, 0, "var(--color-main)"],
                borderColor: "var(--color-main)",
                "& .head::after": {
                    boxShadow: [0, 0, 5, 0, "var(--color-main)"],
                    borderColor: "var(--color-main)"
                }
            },
            "&.isAuthor": {
                boxShadow: [0, 0, 5, 0, "var(--color-dark)"],
                borderColor: "var(--color-dark)",
                "& .head::after": {
                    boxShadow: [0, 0, 5, 0, "var(--color-dark)"],
                    borderColor: "var(--color-dark)"
                }
            }
        },
        avatar: {
            transform: "translateY(-50%)",
            height: 50,
            top: "50%",
            width: 50,
            left: -80,
            "@media (max-width: 1200px)": {
                display: "none"
            }
        },
        user: {
            backgroundColor: "var(--color-primary)",
            color: "var(--text-primary)",
            alignSelf: "center",
            zIndex: 10,
            "&:hover": {
                textDecoration: "none"
            }
        },
        head: {
            borderBottom: "1px solid var(--border-primary)",
            "&::after": {
                transform: "translate(-50%, -50%) rotate(45deg)",
                borderBottom: "1px solid var(--border-primary)",
                boxShadow: [0, 0, 3, 0, "rgba(0, 0, 0, 0.15)"],
                borderLeft: "1px solid var(--border-primary)",
                backgroundColor: "var(--color-primary)",
                position: "absolute",
                content: '""',
                height: 25,
                top: "50%",
                width: 25,
                left: -1,
                "@media (max-width: 1200px)": {
                    content: "none"
                }
            }
        },
        footer: {
            borderTop: "1px solid var(--border-primary)",
            gap: "10px"
        },
        metaboxes: {
            fontFamily: "Montserrat",
            alignItems: "center",
            display: "flex",
            "@media (max-width: 768px)": {
                display: "none"
            }
        },
        metabox: {
            borderLeft: "1px solid var(--border-primary)",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
            padding: [20, 30],
            display: "flex",
            height: "100%"
        },
        metaboxHeader: {
            color: "var(--text-secondary)",
            fontSize: "0.85rem",
            marginBottom: 5
        },
        metaboxValue: {
            fontWeight: "bold"
        },
        likeIcon: {
            marginRight: 3,
            width: 15
        },
        likesAmount: {
            marginRight: 3
        },
        loadingIcon: {
            width: 15
        },
        editorError: {
            color: "var(--color-danger)"
        },
        editedByInput: {
            borderTop: "1px solid var(--border-primary)"
        },
        editedByLabel: {
            color: "var(--text-secondary)",
            fontSize: "0.85rem"
        },
        editedByMessage: {
            fontSize: "0.75rem !important",
            color: "var(--text-secondary)"
        },
        postedAt: {
            fontSize: "0.75rem !important",
            fontFamily: "Montserrat"
        },
        role: {
            fontSize: "1rem"
        },
        signature: {
            marginBottom: "5px !important",
            color: "var(--text-secondary)",
            marginTop: "10px !important",
            fontFamily: "Montserrat",
            paddingTop: 15,
            "&::after": {
                backgroundColor: "var(--text-secondary)",
                position: "absolute",
                content: '""',
                width: 200,
                height: 1,
                left: 0,
                top: 0
            }
        },
        permalink: {
            color: "var(--text-primary) !important",
            right: 5,
            top: 5,
            "&:hover": {
                color: "var(--color-link) !important"
            }
        }
    });
    const classes = styles();

    const [editedByMessage, setEditedByMessage] = useState(
        post.edited_by_message
    );
    const [repuation, setRepuation] = useState(post.user.likesAmount);
    const [updatedAt, setUpdatedAt] = useState(post.updated_at);
    const [likes, setLikes] = useState(post.post_likes.length);
    const [editedBy, setEditedBy] = useState(post.edited_by);
    const [content, setContent] = useState(post.content);

    const [editedByInput, setEditedByInput] = useState("");
    const [editorError, setEditorError] = useState();
    const [hasLiked, setHasLiked] = useState(false);

    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editing, setEditing] = useState(false);
    const [liking, setLiking] = useState(false);

    const { setMessage } = useContext(FeedbackModalContext);
    const { user } = useContext(UserContext);

    const postElement = useRef();

    const isOp = () => thread && thread.user.id === post.user.id;
    const isAuthor = () => thread && user.id === post.user.id;
    const canPost = () => user && !user.suspended;

    function canEdit() {
        if (!user || user.suspended) return false;
        if (user.roles[0].clearance <= 3) return true;
        return isAuthor();
    }

    function canRemove() {
        if (!canEdit) return false;
        if (user.roles[0].clearance <= 2) return true;
        if (thread.firstPost.id === post.id) return false;
        return isAuthor();
    }

    async function toggleLike() {
        const formData = new FormData();
        formData.append("hasLiked", hasLiked);
        setLiking(true);
        const response = await Http.put(`posts/${post.id}/like`);
        setLiking(false);
        errorCodeHandler(response.code, setMessage, () => {
            setRepuation(p => (hasLiked ? p - 1 : p + 1));
            setLikes(p => (hasLiked ? p - 1 : p + 1));
            setHasLiked(p => !p);
        });
    }

    async function deletePost() {
        if (
            !confirm(
                "Are you sure you want to delete this post? This can NOT be undone!"
            )
        )
            return;
        setDeleting(true);
        const response = await Http.delete(`posts/${post.id}`);
        setDeleting(false);
        errorCodeHandler(response.code, setMessage, () => {
            postElement.current.classList.add("removed");
            refetch();
        });
    }

    async function updatePost(e) {
        e.preventDefault();
        const now = new Date();
        const formData = new FormData();
        formData.append("content", content);
        formData.append("editedByMessage", editedByInput);
        setUpdating(true);
        const response = await Http.post(`posts/${post.id}`, {
            body: formData
        });
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
        if (!user) {
            return;
        }
        for (let i = 0; i < post.post_likes.length; i++) {
            if (post.post_likes[i].user_id === user.id) {
                setHasLiked(true);
                break;
            }
        }
    }, [user]);

    useEffect(() => {
        if (Number(window.location.hash.replace("#", "")) === post.id) {
            window.scrollTo(
                0,
                window.scrollY + postElement.current.getBoundingClientRect().top
            );
        }
    }, [window.location.hash]);

    window.addEventListener("beforeunload", function(e) {
        if (post.content !== content)
            e.returnValue = "You have unsaved changes";
    });

    const controlsRender = () => {
        if (!user || !controls) return null;
        return (
            <>
                {editing && editorError && (
                    <p className={classnames(classes.editorError, "p-3 bold")}>
                        {editorError}
                    </p>
                )}
                {editing && (
                    <form
                        className={classnames(classes.editedByInput, "p-3 col")}
                        onSubmit={updatePost}
                    >
                        <label
                            className={classnames(
                                classes.editedByLabel,
                                "mb-2"
                            )}
                        >
                            Edit reason{" "}
                            <span className={classnames("italic")}>
                                (optional)
                            </span>
                        </label>
                        <input
                            className={classnames("input")}
                            value={editedByInput}
                            onChange={e => setEditedByInput(e.target.value)}
                            placeholder="Aa"
                        />
                    </form>
                )}
                <div className={classnames(classes.footer, "row p-3")}>
                    {editButtonsRender()}
                    {!isAuthor() && !editing && (
                        <button
                            className={classnames("btn", {
                                "btn-dark": !hasLiked,
                                loading: liking
                            })}
                            onClick={toggleLike}
                            disabled={liking}
                        >
                            <span
                                className={classnames(
                                    classes.likeButton,
                                    "center-children"
                                )}
                            >
                                {liking ? (
                                    <Icon
                                        className={classnames(
                                            classes.likeIcon,
                                            "mr-0"
                                        )}
                                        path={mdiLoading}
                                        spin={1}
                                    />
                                ) : (
                                    <>
                                        <Icon
                                            className={classnames(
                                                classes.likeIcon
                                            )}
                                            path={mdiThumbUp}
                                        />
                                        <span
                                            className={classnames(
                                                classes.likesAmount
                                            )}
                                        >
                                            ({likes})
                                        </span>
                                    </>
                                )}
                            </span>
                        </button>
                    )}
                    {canPost() && quote && !editing && (
                        <button
                            className={classnames("btn btn-dark")}
                            onClick={() => quote(post)}
                        >
                            Quote
                        </button>
                    )}
                    {canRemove() && (
                        <button
                            className={classnames(
                                "btn ml-auto btn-danger caps",
                                { loading: deleting }
                            )}
                            onClick={deletePost}
                        >
                            {deleting ? (
                                <Icon
                                    className={classnames(classes.loadingIcon)}
                                    path={mdiLoading}
                                    spin={1}
                                />
                            ) : (
                                "Delete"
                            )}
                        </button>
                    )}
                </div>
            </>
        );
    };

    const editButtonsRender = () => {
        if (!canEdit()) return false;
        if (editing) {
            return (
                <>
                    <button
                        className={classnames("btn caps center-children")}
                        onClick={updatePost}
                    >
                        {updating ? (
                            <Icon
                                className={classnames(classes.loadingIcon)}
                                path={mdiLoading}
                                spin={1}
                            />
                        ) : (
                            <span>Save</span>
                        )}
                    </button>
                    <button
                        className={classnames("btn btn-dark caps")}
                        onClick={() => setEditing(false)}
                    >
                        Cancel
                    </button>
                </>
            );
        }
        return (
            <button
                className={classnames("btn btn-dark caps")}
                onClick={() => setEditing(true)}
            >
                Edit
            </button>
        );
    };

    return (
        <article
            className={classnames(
                classes.post,
                { isOp: !isAuthor() && isOp(), isAuthor: isAuthor() },
                "col mb-3 relative"
            )}
            ref={postElement}
        >
            <div className={classnames(classes.head, "row head relative")}>
                <img
                    className={classnames(classes.avatar, "absolute round")}
                    src={`/storage/avatars/${post.user.avatar}`}
                    alt="Profile picture"
                />
                <h3 className={classnames(classes.user, "col p-3")}>
                    <NavLink to={`/user/${post.user.username}`}>
                        {post.user.username}
                    </NavLink>
                    <p className={classnames(classes.role, "ucfirst mt-1")}>
                        {post.user.roles[0].name}
                    </p>
                </h3>
                <aside className={classnames(classes.metaboxes, "ml-auto")}>
                    <div className={classnames(classes.metabox)}>
                        <h4 className={classnames(classes.metaboxHeader)}>
                            Forum Rank
                        </h4>
                        <span className={classnames(classes.metaboxValue)}>
                            {ucfirst(post.user.rank)}
                        </span>
                    </div>
                    <div className={classnames(classes.metabox)}>
                        <h4 className={classnames(classes.metaboxHeader)}>
                            Posts
                        </h4>
                        <span className={classnames(classes.metaboxValue)}>
                            {post.user.postsAmount}
                        </span>
                    </div>
                    <div className={classnames(classes.metabox)}>
                        <h4 className={classnames(classes.metaboxHeader)}>
                            Reputation
                        </h4>
                        <span className={classnames(classes.metaboxValue)}>
                            {repuation}
                        </span>
                    </div>
                    <div className={classnames(classes.metabox)}>
                        <h4 className={classnames(classes.metaboxHeader)}>
                            Registered
                        </h4>
                        <span className={classnames(classes.metaboxValue)}>
                            {humanReadableDate(post.user.created_at)}
                        </span>
                    </div>
                </aside>
            </div>
            {editing ? (
                <MdEditor
                    style={{ height: "100%", minHeight: 250 }}
                    onChange={({ text }) => setContent(text)}
                    renderHTML={text => marked(text)}
                    view={{ menu: true, md: true }}
                    placeholder="Aa"
                    value={content}
                />
            ) : (
                <div
                    className={classnames(
                        classes.body,
                        "p-3 custom-html-style relative"
                    )}
                >
                    {permalink && (
                        <NavLink
                            className={classnames(
                                classes.permalink,
                                "absolute"
                            )}
                            to={`/post/${post.id}`}
                        >
                            <Icon path={mdiLinkVariant} />
                        </NavLink>
                    )}
                    <p className={classnames(classes.postedAt, "bold mb-3")}>
                        Posted{" "}
                        {humanReadableDate(post.created_at).toLowerCase()}
                    </p>
                    <p dangerouslySetInnerHTML={{ __html: marked(content) }} />
                    {editedBy && (
                        <p
                            className={classnames(
                                classes.editedByMessage,
                                "italic mt-3"
                            )}
                        >
                            Edited by {editedBy}{" "}
                            {humanReadableDate(updatedAt).toLowerCase()} "
                            {editedByMessage}"
                        </p>
                    )}
                    {post.user.signature && (
                        <p
                            className={classnames(
                                classes.signature,
                                "relative bold"
                            )}
                        >
                            {post.user.signature}
                        </p>
                    )}
                </div>
            )}
            {controls && controlsRender()}
        </article>
    );
}
