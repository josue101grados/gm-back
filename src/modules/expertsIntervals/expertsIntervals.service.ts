import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { ExpertsInterval } from './expertsInterval.entity';
import { IsNull } from 'typeorm';
import moment = require('moment');
import util = require('util');
import { find } from 'lodash';
import { EventsService } from 'modules/events/events.service';
import { EventStatus } from 'modules/events/event.entity';
import { LeadStatus } from 'modules/leads/sourcedLead.entity';

@Injectable()
export class ExpertsIntervalsService extends TypeOrmCrudService<
  ExpertsInterval
> {
  constructor(
    @InjectRepository(ExpertsInterval) repo,
    private eventsService: EventsService,
  ) {
    super(repo);
  }

  /**
   * Get Available Intervals Grouped by Expert
   * @param requestedDate Date
   * @param model Model requested
   */
  async getAvailableIntervalsByDate(requestedDate: Date, model: string = null) {
    // get intervals date NULL and day is equal to weekday
    // get intervals date = date
    // get events date = date

    // Here you can set the time of each interval for schedule an event
    const eventInterval = 20; // Time in minutes

    const date = moment(requestedDate);
    const weekdayQuery: { [k: string]: any } = { date: IsNull() };
    switch (date.day()) {
      case 0:
        weekdayQuery.sunday = true;
        break;
      case 1:
        weekdayQuery.monday = true;
        break;
      case 2:
        weekdayQuery.tuesday = true;
        break;
      case 3:
        weekdayQuery.wednesday = true;
        break;
      case 4:
        weekdayQuery.thursday = true;
        break;
      case 5:
        weekdayQuery.friday = true;
        break;
      case 6:
        weekdayQuery.saturday = true;
        break;
    }

    // get Intervals based on requested date
    let weekDayIntervals = await this.repo.find({
      where: [weekdayQuery, { date: date.format('YYYY-MM-DD') }],
      relations: ['user'],
      order: {
        user: 'ASC',
        date: 'DESC',
        from: 'ASC',
      },
    });

    // Remove the Experts that are not Active
    weekDayIntervals = weekDayIntervals.filter(
      expert => expert.user.isActive === true,
    );

    // get events from elastic based on requested date
    const events = await this.eventsService.searchEvents({
      from: requestedDate,
      to: requestedDate,
    });

    // get exception events
    const exceptionEvents = await this.eventsService.getExceptionEventsByDate(
      date.format('YYYY-MM-DD'),
    );

    const expertIntervals = {};
    const expertWithExceptions = [];

    // build instervals of eventInterval minutes
    for (const weekDayInterval of weekDayIntervals) {
      let buildInterval = true;
      if (!expertIntervals[weekDayInterval.user.id]) {
        expertIntervals[weekDayInterval.user.id] = {
          fullName: weekDayInterval.user.fullName,
          intervals: [],
        };
      }

      // check if there are specific date intervals that will override the general intervals
      if (weekDayInterval.date) {
        expertWithExceptions.push(weekDayInterval.user.id);
      } else {
        if (expertWithExceptions.indexOf(weekDayInterval.user.id) >= 0) {
          buildInterval = false;
        }
      }

      if (buildInterval) {
        const { from, to } = weekDayInterval;
        const start = moment(`${date.format('YYYY-MM-DD')} ${from}`);
        const end = moment(`${date.format('YYYY-MM-DD')} ${to}`);

        while (start < end) {
          let available = true;

          // checks if exists an exception event for this user in the specific interval
          const existsException = find(
            exceptionEvents,
            e =>
              e.userId === weekDayInterval.user.id &&
              start >= moment(e.startDate) &&
              start < moment(e.endDate),
          );

          if (existsException) {
            available = false;
          }

          // checks if exists an event for this user in the specific interval
          const existsEvent = find(
            events,
            e =>
              e.eventUserId === weekDayInterval.user.id &&
              e.eventStatus !== EventStatus.CANCELLED &&
              start >= moment(e.eventStartDate) &&
              start < moment(e.eventEndDate),
          );

          if (existsEvent) {
            available = false;
          }

          if (model) {
            // checks if exists an event for other user in the specific interval
            const existsModelEvent = find(
              events,
              e =>
                e.model === model &&
                e.eventStatus !== EventStatus.CANCELLED &&
                moment(e.eventStartDate).format('YYYY-MM-DD HH:mm') ===
                  start.format('YYYY-MM-DD HH:mm'),
            );

            if (existsModelEvent) {
              available = false;
            }
          }

          if (available) {
            expertIntervals[weekDayInterval.user.id].intervals.push({
              from: start.format('HH:mm'),
              to: start.add(eventInterval, 'minutes').format('HH:mm'),
            });
          } else {
            start.add(eventInterval, 'minutes');
          }
        }
      }
    }

    return expertIntervals;
  }
}
