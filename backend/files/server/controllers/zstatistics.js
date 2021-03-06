const events = require('../models').events;
module.exports = {
  
  list(req, res) {
    return events
      .FindAll()
      .then(events => res.status(200).send(events))
      .catch(error => res.status(400).send(error));
  },
  
  attendance(req, res) {

    const date_from = req.body.date_from;
    const date_to = req.body.date_to;
    const belong = req.body.belong;

    const query = `SELECT a.name, 
    sum(
      CASE WHEN (a.attended  %2 = 1 ) THEN '1'
    END ) AS mornings,
    sum( 
      CASE WHEN (a.attended > 1 ) THEN '1'
    END ) AS noons
    FROM attendee AS a, events AS e
    WHERE e.id = a.eid 
          AND e.start <= '${date_to}' 
          AND e.start >= '${date_from}' 
          AND e.belongs = ${belong} 
          AND a.attended != 0
    GROUP BY a.name
    ORDER BY mornings DESC`;

    console.log(query);
    sequelize.query(query, { type: sequelize.QueryTypes.SELECT})
    .then(rows => {
      console.log(rows);
      return res.status(200).send(rows);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send(err);
    });
  }, 

  paragraph(req, res) { 

    const date_from = req.body.date_from;
    const date_to = req.body.date_to;
    const belong = req.body.belong;

    const query = `SELECT a.name, sum(paragraph) AS att
    FROM  attendee AS a, events AS e
    WHERE e.id = a.eid 
          AND e.start <= '${date_to}' 
          AND e.start >= '${date_from}'
          AND e.belongs = ${belong}
    GROUP BY a.name
    ORDER BY att DESC`;

    console.log(query);
    sequelize.query(query, { type: sequelize.QueryTypes.SELECT})
    .then(rows => {
      // We don't need spread here, since only the results will be returned for select queries
      console.log(rows);
      return res.status(200).send(rows);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send(err);
    });

    
  }, 

  bible(req, res) {

    const date_from = req.body.date_from;
    const date_to = req.body.date_to;
    const belong = req.body.belong;

    const query = `SELECT a.name, SUM(bible) as att 
    FROM  attendee AS a, events AS e
    WHERE e.id = a.eid 
          AND e.start <= '${date_to}' 
          AND e.start >= '${date_from}' 
          AND belongs = ${belong}
    GROUP BY a.name
    ORDER BY att DESC`;

    console.log(query);
    sequelize.query(query, { type: sequelize.QueryTypes.SELECT})
    .then(rows => {
      // We don't need spread here, since only the results will be returned for select queries
      console.log(rows);
      return res.status(200).send(rows);
    })
    .catch(err => {
      console.log(err);
      return res.status(500).send(err);
    });
  },

};