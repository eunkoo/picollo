const user = require('../models').user

module.exports = {

  list (req, res) {
    return user
      .all()
      .then(user => res.status(200).send(user))
      .catch(error => res.status(400).send(error))
  },

  destroy (req, res) {
    return user
      .findById(req.params.iduser)
      .then(user => {
        if (!user) {
          return res.status(400).send({
            message: '가입정보가 없습니다'
          })
        }
        return user
          .destroy()
          .then(() => res.status(204).send())
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  },

  check_create(req,res){
      return user.findOne({
      where: {
        email: req.body.email
      }
    })
    .then(user => res.status(200).send(user))
    .catch(error => res.status(404).send(error))
    
  },
  create (req, res) {
    return user
        .create({
          name: req.body.name,
          apellidos: req.body.apellidos,
          edad: req.body.edad,
          email: req.body.email,
          password: req.body.password,
          grade: req.body.grade,
          createdAt: req.body.createdAt,
          updatedAt: req.body.updatedAt
        })
        .then(user => res.status(201).send(user))
        .catch(error => res.status(410).send(error))
    
  },

  update (req, res) {
     user
      .findById(req.params.iduser)
      .then(user => {
        if (!user) {
          return res.status(404).send({
            message: '가입 정보가 없습니다'
          })
        }
        return user
          .update({
            name: req.body.name || user.name,
            apellidos: req.body.apellidos || user.apellidos,
            edad: req.body.edad || user.edad,
            email: req.body.email || user.email,
            password: req.body.password || user.password
          })
          .then(() => res.status(200).send(user))
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  },

  userLogin (req, res) {
    return user
      .findOne({
        where: {
          email: req.body.email,
          password: req.body.password
        }
      })
      .then(user => {
        if (!user) {
          return res.status(404).send({
            message: '가입 정보가 없습니다'
          })
        } else {
          return res.status(200).send(user)
        }
      })
      .catch(error => res.status(400).send(error))
  }
}
