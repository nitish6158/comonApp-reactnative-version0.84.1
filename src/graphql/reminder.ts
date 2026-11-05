import gql from "graphql-tag";

export const CREATE_REMINDER = gql`
  mutation createReminder($input: ReminderInput!) {
    createReminder(input: $input) {
      type
      title
      participants {
        _id
        accepted
        role
        firstName
        lastName
        phone
        profile_img
        left_at
      }
      startDate
      endDate
      roomId
      time
      isAllDay
      endTime
      recursive
      startTimeInMs
      daylyParams {
        dayOfWeeks
        everyWeek
      }
      monthlyParams {
        months
        twicePerMonth
      }
      description
      approvalReminderTime {
        _id
        Count
        Unit
      }
    }
  }
`;

export const CREATE_APPOINTMENT = gql`
  mutation createAppointment($input: AppointmentInput!) {
    createAppointment(input: $input) {
      type
      title
      participants {
        _id
        accepted
        role
        firstName
        lastName
        phone
        profile_img
        left_at
      }
      startDate
      endDate
      roomId
      time
      isAllDay
      endTime
      recursive
      description
      daylyParams {
        dayOfWeeks
        everyWeek
      }
      monthlyParams {
        months
        twicePerMonth
      }
      approvalReminderTime {
        _id
        Count
        Unit
      }
      attachment {
        type
        url
        name
        thumbnail
        duration
        mimeType
      }
      location {
        _id
        address
        latitude
        longitude
        mapUrl
        countryOffset
      }
    }
  }
`;

export const DRAG_DROP = gql`
  mutation updateDragDrop($input: ReminderInput!) {
    updateDragDrop(input: $input) {
      type
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation deleteReminder($input: deleteReminderInput!) {
    deleteReminder(input: $input) {
      type
    }
  }
`;

export const DELETE_SCHEDULE = gql`
  mutation deleteSchedule($input: deleteReminderInput!) {
    deleteSchedule(input: $input) {
      type
    }
  }
`;

export const UPDATE_PARTICIPANT_STATUS = gql`
  mutation updateReminderApprovalStatus($input: UpdateAprovalStatusInput!) {
    updateReminderApprovalStatus(input: $input) {
      type
    }
  }
`;

export const UPDATE_PARTICIPANT_STATUS_ALL = gql`
  mutation updateReminderApprovalParent($input: UpdateAprovalStatusInput!) {
    updateReminderApprovalParent(input: $input) {
      type
    }
  }
`;

export const UPDATE_REMINDER = gql`
  mutation updateReminder($input: ReminderInput!) {
    updateReminder(input: $input) {
      type
      title
      participants {
        _id
        accepted
        role
        firstName
        lastName
        phone
        profile_img
        left_at
      }
      startDate
      endDate
      roomId
      time
      isAllDay
      endTime
      recursive
      startTimeInMs
      daylyParams {
        dayOfWeeks
        everyWeek
      }
      monthlyParams {
        months
        twicePerMonth
      }
      description
      approvalReminderTime {
        _id
        Count
        Unit
      }
    }
  }
`;

export const UPDATE_SCHEDULE = gql`
  mutation updateSchedule($input: scheduleInput!) {
    updateSchedule(input: $input) {
      type
      message {
        message
        fileURL
        thumbnail
        duration
        type
      }
      startDate
      roomId
      time
      approvalReminderTime {
        Count
        Unit
      }
    }
  }
`;

export const RESEND_REMINDER = gql`
  mutation ResendReminder($input: IdDto!) {
    ResendReminder(input: $input) {
      type
      title
      participants {
        _id
        accepted
        role
        firstName
        lastName
        phone
        profile_img
        left_at
      }
      startDate
      endDate
      roomId
      time
      isAllDay
      endTime
      recursive
      startTimeInMs
      daylyParams {
        dayOfWeeks
        everyWeek
      }
      monthlyParams {
        months
        twicePerMonth
      }
      description
      approvalReminderTime {
        _id
        Count
        Unit
      }
    }
  }
`;

export const CREATE_SCHEDULE = gql`
  mutation createSchedule($input: scheduleInput!) {
    createSchedule(input: $input) {
      type
      roomId
      startDate
      endDate
      time
      message {
        _id
        roomId
        type
        fileURL
        isForwarded
        message
        fontStyle
        thumbnail
        duration
      }
    }
  }
`;

export const GET_REMINDER_RANGE = gql`
  query getReminderRange($input: childReminderInput!) {
    getReminderRange(input: $input) {
      date
      totalPage
      reminders {
        _id
        parent_id
        title
        type
        date
        time
        roomId
        roomType
        recursive
        participants {
          _id
          accepted
          role
          firstName
          lastName
          profile_img
          left_at
        }
        attachment {
          type
          url
          name
          thumbnail
          duration
          mimeType
        }
        approvalReminderTime {
          _id
          Count
          Unit
        }
        location {
          _id
          address
          latitude
          longitude
          mapUrl
          countryOffset
        }
      }
    }
  }
`;

export const GET_SCHEDULE_BY_ROOM_ID = gql`
  query getScheduleByRoomID($input: childReminderInput!) {
    getScheduleByRoomID(input: $input) {
      date
      totalPage
      reminders {
        _id
        parent_id
        type
        roomId
        startDate
        endDate
        time
        message {
          _id
          roomId
          type
          fileURL
          isForwarded
          message
          fontStyle
          thumbnail
          duration
        }
        isApprovalNeeded
        approvalReminderTime {
          Count
          Unit
        }
        recursive
        daylyParams {
          dayOfWeeks
          everyWeek
        }
        monthlyParams {
          months
          onDay
          onWeek {
            dayOfWeeks
            everyWeek
          }
          twicePerMonth
        }
        roomType
      }
    }
  }
`;
