import moment from "moment";

export const FirstHalfOfYear = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
]

export const SecondHalfOfYear = [
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
]

const isCompleted = (assignment: any) => {
    const assign = { ...assignment, 'completeTime': +moment() }
    const day = 'Mon'
    const getDay = moment(assign?.completeTime).format('ddd');
    const getWeek = moment(assign?.completeTime).week();
    const week = moment().week()
    const month = moment().format('M')
    const getMonth = moment(assign?.completedTime).format('M')
    const quarter = moment().quarter()
    const getQuarter = moment(assign?.completedTime).quarter()
    const halfYear = moment().get('quarter') < 3 ? 1 : 2
    const getHalfYear = moment(assign?.completedTime).get('quarter') < 3 ? 1 : 2
    const year = moment().year()
    const getYear = moment(assign?.completedTime).year()

    switch (assign?.recurrent) {
        case 'ONCE':
            return false;
        case 'DAILY':
            return !(getDay === day)
        case 'WEEKLY':
            return !(week === getWeek);
        case 'MONTHLY':
            return !(month === getMonth);
        case 'QUARTERLY':
            return !(quarter === getQuarter)
        case 'HALFYEARLY':
            return !(halfYear === getHalfYear)
        case 'ANNUALLY':
            return !(year === getYear)
        default:
            return true;
    }
}
    
export const FilterAssignments = (assignments: any) => {
    return assignments.filter((item: any) => {
        if (item?.completeTime) {
            return isCompleted(item)
        } else {
            return true;
        }
    })
}