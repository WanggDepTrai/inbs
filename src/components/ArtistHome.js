import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddArtistForm from './ArtistForm';
import EditArtistModal from './EditArtistModal';
import '../css/ArtistHome.css';

function ArtistHome() {
	const navigate = useNavigate();
	const [artists, setArtists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const [showAddArtistForm, setShowAddArtistForm] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedArtist, setSelectedArtist] = useState(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteArtistId, setDeleteArtistId] = useState(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
	const [stats, setStats] = useState({
		totalArtists: 0,
		totalExperience: 0,
		averageRating: 0,
	});

	useEffect(() => {
		fetchArtists();
	}, []);

	// Clear status message after 3 seconds
	useEffect(() => {
		if (statusMessage.text) {
			const timer = setTimeout(() => {
				setStatusMessage({ text: '', type: '' });
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [statusMessage]);

	const fetchArtists = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/odata/Artist'
			);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			setArtists(data.value);

			// Calculate statistics from API data
			const artistCount = data.value.length;
			const totalExperience = data.value.reduce((sum, artist) => sum + artist.YearsOfExperience, 0);
			const ratings = data.value.filter((artist) => artist.AverageRating > 0);
			const avgRating =
				ratings.length > 0
					? (ratings.reduce((sum, artist) => sum + artist.AverageRating, 0) / ratings.length).toFixed(1)
					: 0;

			setStats({
				totalArtists: artistCount,
				totalExperience: totalExperience,
				averageRating: avgRating,
			});

			setLoading(false);
		} catch (err) {
			setError('Failed to fetch artists data. Please try again later.');
			setLoading(false);
			console.error('Error fetching data:', err);
		}
	};

	const handleLogout = () => {
		// Logic for logout (e.g., clearing tokens, session data)
		navigate('/');
	};

	const toggleMobileNav = () => {
		setMobileNavOpen(!mobileNavOpen);
	};

	const toggleAddArtistForm = () => {
		setShowAddArtistForm(!showAddArtistForm);
	};

	const handleArtistAdded = () => {
		// Refresh the artist list after adding a new artist
		fetchArtists();
		setShowAddArtistForm(false);
	};

	const handleEditArtist = (artist) => {
		// Open edit modal with the selected artist
		setSelectedArtist(artist);
		setShowEditModal(true);
	};

	const closeEditModal = () => {
		setShowEditModal(false);
		setSelectedArtist(null);
	};

	const handleArtistUpdated = () => {
		// Refresh the artist list after updating
		fetchArtists();
	};

	// Open delete confirmation
	const handleDeleteClick = (artistId, artistName) => {
		setDeleteArtistId(artistId);
		setShowDeleteConfirm(true);
	};

	// Close delete confirmation
	const cancelDelete = () => {
		setShowDeleteConfirm(false);
		setDeleteArtistId(null);
	};

	// Execute the delete action
	const confirmDelete = async () => {
		if (!deleteArtistId) return;

		try {
			setDeleteLoading(true);

			const response = await fetch(
				`https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Artist?id=${deleteArtistId}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to delete artist (Status: ${response.status})`);
			}

			// Show success message
			setStatusMessage({
				text: 'Artist deleted successfully!',
				type: 'success',
			});

			// Close confirmation dialog
			setShowDeleteConfirm(false);
			setDeleteArtistId(null);

			// Refresh the artist list
			fetchArtists();
		} catch (err) {
			console.error('Error deleting artist:', err);
			setStatusMessage({
				text: `Failed to delete artist: ${err.message}`,
				type: 'error',
			});
		} finally {
			setDeleteLoading(false);
		}
	};

	// Find the artist being deleted (for the confirmation dialog)
	const artistToDelete = deleteArtistId ? artists.find((artist) => artist.ID === deleteArtistId) : null;

	return (
		<div className='artist-home-container'>
			<nav className='artist-nav'>
				<div className='nav-brand'>
					<h1>Artist Dashboard</h1>
				</div>
				<div className={`nav-links ${mobileNavOpen ? 'show' : ''}`}>
					<a href='#profile'>Profile</a>
					<a href='#works'>My Works</a>
					<a href='#settings'>Settings</a>
					<button onClick={handleLogout} className='logout-btn'>
						Logout
					</button>
				</div>
				<div className='nav-toggle' onClick={toggleMobileNav}>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</nav>

			<main className='artist-main'>
				{showAddArtistForm ? (
					<div className='form-container'>
						<AddArtistForm onArtistAdded={handleArtistAdded} onCancel={toggleAddArtistForm} />
					</div>
				) : (
					<>
						<div className='welcome-section'>
							<h2>Welcome to Artist Dashboard</h2>
							<p>Manage your artwork and track performance metrics</p>
							<button className='add-artist-btn' onClick={toggleAddArtistForm}>
								Add New Artist
							</button>
						</div>

						{loading ? (
							<div className='loading'>
								<div className='loading-spinner'></div>
								<p>Loading artist data...</p>
							</div>
						) : error ? (
							<div className='error-message'>
								<p>{error}</p>
								<button onClick={() => fetchArtists()} className='retry-btn'>
									Retry
								</button>
							</div>
						) : (
							<>
								<div className='dashboard-stats'>
									<div className='stat-card'>
										<h3>Total Artists</h3>
										<p className='stat-value'>{stats.totalArtists}</p>
									</div>
									<div className='stat-card'>
										<h3>Combined Experience</h3>
										<p className='stat-value'>
											{stats.totalExperience} <span className='stat-unit'>years</span>
										</p>
									</div>
									<div className='stat-card'>
										<h3>Average Rating</h3>
										<p className='stat-value'>
											{stats.averageRating} <span className='stat-unit'>/ 5</span>
										</p>
									</div>
								</div>

								<div className='artist-list-section'>
									<div className='section-header'>
										<h3>Artists Directory</h3>
										<button className='refresh-btn' onClick={fetchArtists}>
											Refresh
										</button>
									</div>

									{artists.length === 0 ? (
										<div className='empty-state'>
											<p>No artists found in the system.</p>
											<button className='add-artist-btn' onClick={toggleAddArtistForm}>
												Add Your First Artist
											</button>
										</div>
									) : (
										<div className='artist-list'>
											{artists.map((artist) => (
												<div key={artist.ID} className='artist-card'>
													<div className='artist-header'>
														<h4>
															{artist.FullName ||
																`Artist ${artist.ID.substring(0, 8)}...`}
														</h4>
														<div className='artist-actions'>
															<button
																className='edit-btn'
																onClick={() => handleEditArtist(artist)}
															>
																Edit
															</button>
															<button
																className='delete-btn'
																onClick={() => handleDeleteClick(artist.ID)}
															>
																Delete
															</button>
														</div>
													</div>
													<div className='artist-details'>
														<p>
															<strong>Experience:</strong> {artist.YearsOfExperience}{' '}
															years
														</p>
														<p>
															<strong>Level:</strong> {artist.Level}
														</p>
														<p>
															<strong>Rating:</strong>{' '}
															{artist.AverageRating || 'Not rated'}
														</p>
														<p>
															<strong>Phone:</strong> {artist.PhoneNumber || 'N/A'}
														</p>
														{artist.DateOfBirth && (
															<p>
																<strong>DOB:</strong>{' '}
																{new Date(artist.DateOfBirth).toLocaleDateString()}
															</p>
														)}
														<p className='store-id'>
															<strong>Store:</strong> {artist.StoreId.substring(0, 8)}...
														</p>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</>
						)}
					</>
				)}
			</main>

			{/* Edit Artist Modal */}
			{showEditModal && selectedArtist && (
				<EditArtistModal
					artist={selectedArtist}
					onClose={closeEditModal}
					onArtistUpdated={handleArtistUpdated}
				/>
			)}

			{/* Delete Confirmation Dialog (Inline) */}
			{showDeleteConfirm && artistToDelete && (
				<div className='delete-confirmation-overlay'>
					<div className='delete-confirmation-dialog'>
						<div className='delete-confirmation-header'>
							<h3>Confirm Delete</h3>
							<button className='close-button' onClick={cancelDelete}>
								×
							</button>
						</div>
						<div className='delete-confirmation-content'>
							<div className='warning-icon'>⚠️</div>
							<p>Are you sure you want to delete this artist?</p>
							<div className='artist-info-box'>
								<p>
									<strong>Name:</strong>{' '}
									{artistToDelete.FullName || `Artist ${artistToDelete.ID.substring(0, 8)}...`}
								</p>
								<p>
									<strong>Experience:</strong> {artistToDelete.YearsOfExperience} years
								</p>
								<p>
									<strong>Level:</strong> {artistToDelete.Level}
								</p>
							</div>
							<p className='delete-warning'>This action cannot be undone.</p>
						</div>
						<div className='delete-confirmation-actions'>
							<button className='cancel-delete-btn' onClick={cancelDelete} disabled={deleteLoading}>
								Cancel
							</button>
							<button className='confirm-delete-btn' onClick={confirmDelete} disabled={deleteLoading}>
								{deleteLoading ? (
									<>
										<span className='delete-spinner'></span>
										Deleting...
									</>
								) : (
									'Delete Artist'
								)}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Status Message */}
			{statusMessage.text && <div className={`status-message ${statusMessage.type}`}>{statusMessage.text}</div>}

			<footer className='artist-footer'>
				<p>&copy; 2025 Artist Dashboard Platform. All rights reserved.</p>
			</footer>
		</div>
	);
}

export default ArtistHome;