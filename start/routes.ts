/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import RegistersController from '#controllers/registers_controller'
import SessionController from '#controllers/session_controller'
import { middleware } from '#start/kernel'
import LogoutsController from '#controllers/logouts_controller'

router.on('/').render('pages/home')
router.on('/signupView').render('pages/signup')
router.on('/login').render('pages/login')
router.on('/dashboard').render('pages/dashboard').use(middleware.auth())
router.post('/login', [SessionController, 'loginStore'])
router.post('/signup', [RegistersController, 'createUser']).as('showSingup')
router.get('/logout', [LogoutsController, 'storeLogout']).use(middleware.auth())
