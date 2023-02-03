import { gql } from '@apollo/client'
import { COMMENTS } from './comments'

export const ITEM_FIELDS = gql`
  fragment ItemFields on Item {
    id
    parentId
    createdAt
    deletedAt
    title
    url
    user {
      name
      streak
      id
    }
    fwdUser {
      name
      streak
      id
    }
    sats
    upvotes
    boost
    bounty
    bountyPaidTo
    path
    meSats
    meDontLike
    outlawed
    freebie
    ncomments
    commentSats
    lastCommentAt
    maxBid
    isJob
    company
    location
    remote
    sub {
      name
      baseCost
    }
    pollCost
    status
    uploadId
    mine
    root {
      id
      title
      sub {
        name
      }
      user {
        name
        streak
        id
      }
    }
  }`

export const ITEM_OTS_FIELDS = gql`
  fragment ItemOtsFields on Item {
    id
    title
    text
    url
    parentOtsHash
    otsHash
    deletedAt
  }`

export const ITEM_OTS = gql`
  ${ITEM_OTS_FIELDS}

  query Item($id: ID!) {
    item(id: $id) {
      ...ItemOtsFields
    }
  }`

export const ITEMS = gql`
  ${ITEM_FIELDS}

  query items($sub: String, $sort: String, $type: String, $cursor: String, $name: String, $within: String) {
    items(sub: $sub, sort: $sort, type: $type, cursor: $cursor, name: $name, within: $within) {
      cursor
      items {
        ...ItemFields
        position
      },
      pins {
        ...ItemFields
        position
      }
    }
  }`

export const TOP_ITEMS = gql`
  ${ITEM_FIELDS}

  query topItems($sort: String, $cursor: String, $when: String) {
    topItems(sort: $sort, cursor: $cursor, when: $when) {
      cursor
      items {
        ...ItemFields
        position
      },
      pins {
        ...ItemFields
        position
      }
    }
  }`

export const OUTLAWED_ITEMS = gql`
  ${ITEM_FIELDS}

  query outlawedItems($cursor: String) {
    outlawedItems(cursor: $cursor) {
      cursor
      items {
        ...ItemFields
        text
      }
    }
  }`

export const BORDERLAND_ITEMS = gql`
  ${ITEM_FIELDS}

  query borderlandItems($cursor: String) {
    borderlandItems(cursor: $cursor) {
      cursor
      items {
        ...ItemFields
        text
      }
    }
  }`

export const FREEBIE_ITEMS = gql`
  ${ITEM_FIELDS}

  query freebieItems($cursor: String) {
    freebieItems(cursor: $cursor) {
      cursor
      items {
        ...ItemFields
        text
      }
    }
  }`

export const POLL_FIELDS = gql`
  fragment PollFields on Item {
    poll {
      meVoted
      count
      options {
        id
        option
        count
        meVoted
      }
    }
  }`

export const ITEM = gql`
  ${ITEM_FIELDS}
  ${POLL_FIELDS}

  query Item($id: ID!) {
    item(id: $id) {
      ...ItemFields
      ...PollFields
      text
    }
  }`

export const COMMENTS_QUERY = gql`
  ${COMMENTS}

  query Comments($id: ID!, $sort: String) {
    comments(id: $id, sort: $sort) {
      ...CommentsRecursive
    }
  }
`

export const ITEM_FULL = gql`
  ${ITEM_FIELDS}
  ${POLL_FIELDS}
  ${COMMENTS}
  query Item($id: ID!) {
    item(id: $id) {
      ...ItemFields
      prior
      position
      text
      ...PollFields
      comments {
        ...CommentsRecursive
      }
    }
  }`

export const ITEM_WITH_COMMENTS = gql`
  ${ITEM_FIELDS}
  ${COMMENTS}
  fragment ItemWithComments on Item {
      ...ItemFields
      text
      comments {
        ...CommentsRecursive
      }
    }`

export const BOUNTY_ITEMS_BY_USER_NAME = gql`
  ${ITEM_FIELDS}
  query getBountiesByUserName($name: String!) {
    getBountiesByUserName(name: $name) {
      cursor
      items {
        ...ItemFields
      }
    }
  }`

export const ITEM_SEARCH = gql`
  ${ITEM_FIELDS}
  query Search($q: String, $cursor: String, $sort: String, $what: String, $when: String) {
    search(q: $q, cursor: $cursor, sort: $sort, what: $what, when: $when) {
      cursor
      items {
        ...ItemFields
        text
        searchTitle
        searchText
      }
    }
  }
`

export const RELATED_ITEMS = gql`
  ${ITEM_FIELDS}
  query Related($title: String, $id: ID, $cursor: String, $limit: Int) {
    related(title: $title, id: $id, cursor: $cursor, limit: $limit) {
      cursor
      items {
        ...ItemFields
      }
    }
  }
`

export const RELATED_ITEMS_WITH_ITEM = gql`
  ${ITEM_FIELDS}
  query Related($title: String, $id: ID, $cursor: String, $limit: Int) {
    item(id: $id) {
      ...ItemFields
    }
    related(title: $title, id: $id, cursor: $cursor, limit: $limit) {
      cursor
      items {
        ...ItemFields
      }
    }
  }
`
