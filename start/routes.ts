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
import CreateTweetsController from '#controllers/create_tweets_controller'
import RetweetsController from '#controllers/retweets_controller'
import LikesController from '#controllers/likes_controller'
import CommentsController from '#controllers/comments_controller'
import FollowsController from '#controllers/follows_controller'
import ProfilesController from '#controllers/profils_controller'
import BlocksController from '#controllers/blocks_controller'
import HashtagsController from '#controllers/hashtags_controller'
// import HashtagsController from '#controllers/hashtags_controller'

router.on('/').render('pages/home')
router.on('/signupView').render('pages/signup')
router.on('/login').render('pages/login')
// router.on('/profil').render('pages/profil').use(middleware.auth()).as('profil.view')
// router.on('/dashboard').render('pages/dashboard').use(middleware.auth()).as('dashboard')
router.get('/dashboard', [CreateTweetsController, 'index']).use(middleware.auth()).as('dashboard')
router.post('/login', [SessionController, 'loginStore'])
router.post('/signup', [RegistersController, 'createUser']).as('showSingup')
router.get('/logout', [LogoutsController, 'storeLogout']).use(middleware.auth())
router.post('/tweets', [CreateTweetsController, 'store']).use(middleware.auth())
router
  .post('/tweets/:id', [CreateTweetsController, 'destroy'])
  .as('tweets.delete')
  .use(middleware.auth())

router
  .post('/tweets/:id/retweet', [RetweetsController, 'toggleRetweet'])
  .as('tweets.retweet')
  .use(middleware.auth())

router
  .post('/tweets/:id/like', [LikesController, 'toggleLike'])
  .as('tweets.like')
  .use(middleware.auth())

router
  .post('/tweets/:id/reply', [CommentsController, 'reply'])
  .as('tweets.reply')
  .use(middleware.auth())

router
  .post('/follow/:id', [FollowsController, 'toggleFollow'])
  .as('follow.toggle')
  .use(middleware.auth())

router
  .get('/profil', [ProfilesController, 'myProfile'])
  .use([middleware.auth(), middleware.checkBlocked()])
  .as('profil.view')

// Route pour voir le profil d'un autre utilisateur
router
  .get('/profile/:id', [ProfilesController, 'showUserProfile'])
  .use([middleware.auth(), middleware.checkBlocked()])
  .as('profiles.show')

// Routes pour les blocages
router
  .post('/blocks/toggle/:id', [BlocksController, 'toggle'])
  .use(middleware.auth())
  .as('blocks.toggle')

router
  .get('/hashtag/:tag', [HashtagsController, 'showHashtags'])
  .as('hashtags.show')
  .use(middleware.auth())
