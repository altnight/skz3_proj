#!/bin/sh

git filter-branch --commit-filter 'GIT_AUTHOR_NAME="atasatamatara" GIT_AUTHOR_EMAIL="atasatamatara@gmail.com" GIT_COMMITTER_NAME="atasatamatara" GIT_COMMITTER_EMAIL="atasatamatara@gmail.com" git commit-tree "$@"' HEAD
