import gql from "graphql-tag";

export const POSITION_FRAGMENT = gql`
  fragment PositionDetails on Position {
    x
    y
  }
`;