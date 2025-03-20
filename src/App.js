import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import Store from './components/Store';
import Artist from './components/Artist';
import Waitlist from './components/Waitlist';
import ArtistHome from './components/ArtistHome';
import AddArtist from './components/AddArtist';
import Accessory from './components/Acessory';
import ArtistForm from './components/ArtistForm';
import EditArtistForm from './components/EditArtistModal';

function App() {
	return (
		<Router>
			<Routes>
				<Route path='/' element={<Login />} />
				<Route path='/home' element={<Home />} />
				<Route path='/store' element={<Store />} />
				<Route path='/artist' element={<Artist />} />
				<Route path='/waitlist' element={<Waitlist />} />
				<Route path='/artisthome' element={<ArtistHome />} />
				<Route path='/add-artist' element={<AddArtist />} />
				<Route path='/add-artistform' element={<ArtistForm />} />
				<Route path='/edit-artist/:id' element={<EditArtistForm />} />
				<Route path='/accessory' element={<Accessory />} />
			</Routes>
		</Router>
	);
}

export default App;