import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Artist.css';
import AddArtistForm from './ArtistForm';
import EditArtistModal from './EditArtistModal';

function Artist() {
	const [artists, setArtists] = useState([]);
	const [showSidebar, setShowSidebar] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
	const [selectedStore, setSelectedStore] = useState('all');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
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

	const navigate = useNavigate();

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

	const handleLogout = () => navigate('/');
	const handleHome = () => navigate('/home');
	const handleStore = () => navigate('/store');
	const handleWaitlist = () => navigate('/waitlist');

	const handleSearch = (event) => {
		setSearchTerm(event.target.value);
	};

	const handleStoreFilter = (event) => {
		setSelectedStore(event.target.value);
	};

	const requestSort = (key) => {
		let direction = 'ascending';
		if (sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

	// Safe function to get a truncated string with fallback for undefined values
	const truncateString = (str, length = 8) => {
		if (!str) return 'N/A'; // Return 'N/A' if the string is undefined or null
		return `${str.substring(0, length)}...`;
	};

	const getUniqueStores = () => {
		const storeIds = artists
			.map((artist) => artist.StoreId)
			.filter((storeId) => storeId !== null && storeId !== undefined); // Filter out null or undefined values
		return [...new Set(storeIds)];
	};

	const toggleAddArtistForm = () => {
		setShowAddArtistForm(!showAddArtistForm);
	};

	const handleArtistAdded = () => {
		// Refresh the artist list after adding a new artist
		fetchArtists();
		setShowAddArtistForm(false);
		setStatusMessage({
			text: 'Artist added successfully!',
			type: 'success',
		});
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
		setStatusMessage({
			text: 'Artist updated successfully!',
			type: 'success',
		});
	};

	// Open delete confirmation
	const handleDeleteClick = (artistId) => {
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

	// Filter and sort artists
	const filteredAndSortedArtists = Array.isArray(artists)
		? artists
				.filter((artist) =>
					// Generic search across all fields
					Object.values(artist).join(' ').toLowerCase().includes(searchTerm.toLowerCase())
				)
				.filter((artist) => (selectedStore === 'all' ? true : artist.StoreId === selectedStore))
				.sort((a, b) => {
					if (!sortConfig.key) return 0;

					// Handle special cases for the nested or differently named properties
					let aValue, bValue;

					switch (sortConfig.key) {
						case 'name':
							aValue = a.FullName || '';
							bValue = b.FullName || '';
							break;
						case 'contact':
							aValue = a.PhoneNumber || '';
							bValue = b.PhoneNumber || '';
							break;
						case 'experience':
							aValue = a.YearsOfExperience || 0;
							bValue = b.YearsOfExperience || 0;
							break;
						case 'status':
							// You might need to adjust how status is determined
							aValue = a.Status || false;
							bValue = b.Status || false;
							break;
						default:
							aValue = a[sortConfig.key];
							bValue = b[sortConfig.key];
					}

					if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
					if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
					return 0;
				})
		: [];

	return (
		<div className='artist-container'>
			<div
				className={`sidebar ${showSidebar ? 'expanded' : ''}`}
				onMouseEnter={() => setShowSidebar(true)}
				onMouseLeave={() => setShowSidebar(false)}
			>
				<div className='logo'>
					<h1 className={showSidebar ? 'expanded' : ''}>{showSidebar ? 'INBS' : 'IB'}</h1>
				</div>

				<div className='nav-buttons'>
					<button onClick={handleHome} className='nav-button'>
						<span style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}>🏠</span>
						{showSidebar && 'Home'}
					</button>

					<button onClick={handleStore} className='nav-button'>
						<span style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}>📊</span>
						{showSidebar && 'Store'}
					</button>

					<button onClick={handleWaitlist} className='nav-button'>
						<span style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}>⏳</span>
						{showSidebar && 'Waitlist'}
					</button>

					<button onClick={handleLogout} className='nav-button logout'>
						<span style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}>⬅️</span>
						{showSidebar && 'Logout'}
					</button>
				</div>
			</div>

			<div className={`main-content ${showSidebar ? 'sidebar-expanded' : ''}`}>
				{showAddArtistForm ? (
					<div className='form-container'>
						<AddArtistForm onArtistAdded={handleArtistAdded} onCancel={toggleAddArtistForm} />
					</div>
				) : (
					<>
						<div className='header'>
							<h1>Artist Management</h1>
							<button
								onClick={toggleAddArtistForm}
								className='add-button'
								style={{
									padding: '12px 24px',
									backgroundColor: '#4CAF50',
									color: 'white',
									border: 'none',
									borderRadius: '5px',
									cursor: 'pointer',
									marginLeft: '20px',
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									fontSize: '16px',
									fontWeight: '500',
									boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
								}}
							>
								<span>➕</span>
								Add New Artist
							</button>
						</div>

						{/* Stats Section */}
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

						<div className='search-bar'>
							<input
								type='text'
								className='search-input'
								placeholder='Search artists...'
								value={searchTerm}
								onChange={handleSearch}
							/>
							<select
								value={selectedStore}
								onChange={handleStoreFilter}
								className='store-filter'
								style={{
									padding: '10px',
									marginLeft: '10px',
									borderRadius: '8px',
									border: '1px solid #ddd',
								}}
							>
								<option value='all'>All Stores</option>
								{getUniqueStores().map((store, index) => (
									<option key={index} value={store}>
										{truncateString(store, 8)}
									</option>
								))}
							</select>
							<button
								className='refresh-btn'
								onClick={fetchArtists}
								style={{
									padding: '10px 15px',
									marginLeft: '10px',
									borderRadius: '8px',
									border: '1px solid #ddd',
									background: '#f8f8f8',
									cursor: 'pointer',
								}}
							>
								Refresh
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
							<div className='artists-list'>
								<h2>Artists List</h2>

								<table className='artists-table'>
									<thead>
										<tr>
											<th onClick={() => requestSort('name')} className='table-header'>
												Name{' '}
												{sortConfig.key === 'name' &&
													(sortConfig.direction === 'ascending' ? '↑' : '↓')}
											</th>
											<th onClick={() => requestSort('contact')} className='table-header'>
												Contact{' '}
												{sortConfig.key === 'contact' &&
													(sortConfig.direction === 'ascending' ? '↑' : '↓')}
											</th>
											<th onClick={() => requestSort('experience')} className='table-header'>
												Experience{' '}
												{sortConfig.key === 'experience' &&
													(sortConfig.direction === 'ascending' ? '↑' : '↓')}
											</th>
											<th onClick={() => requestSort('Level')} className='table-header'>
												Level{' '}
												{sortConfig.key === 'Level' &&
													(sortConfig.direction === 'ascending' ? '↑' : '↓')}
											</th>
											<th onClick={() => requestSort('AverageRating')} className='table-header'>
												Rating{' '}
												{sortConfig.key === 'AverageRating' &&
													(sortConfig.direction === 'ascending' ? '↑' : '↓')}
											</th>
											<th onClick={() => requestSort('StoreId')} className='table-header'>
												Store ID{' '}
												{sortConfig.key === 'StoreId' &&
													(sortConfig.direction === 'ascending' ? '↑' : '↓')}
											</th>
											<th className='table-header'>Actions</th>
										</tr>
									</thead>
									<tbody>
										{filteredAndSortedArtists.length === 0 ? (
											<tr>
												<td colSpan='7' style={{ textAlign: 'center', padding: '20px' }}>
													No artists found.
													<button
														onClick={toggleAddArtistForm}
														style={{
															marginLeft: '10px',
															padding: '5px 10px',
															background: '#4CAF50',
															color: 'white',
															border: 'none',
															borderRadius: '4px',
															cursor: 'pointer',
														}}
													>
														Add Your First Artist
													</button>
												</td>
											</tr>
										) : (
											filteredAndSortedArtists.map((artist) => (
												<tr key={artist.ID} className='table-row'>
													<td className='table-cell name'>
														{artist.FullName ||
															(artist.ID ? truncateString(artist.ID, 8) : 'Unknown')}
													</td>
													<td className='table-cell'>{artist.PhoneNumber || 'N/A'}</td>
													<td className='table-cell'>{artist.YearsOfExperience} years</td>
													<td className='table-cell'>{artist.Level}</td>
													<td className='table-cell'>
														<span
															className={`status-badge ${
																artist.AverageRating > 4
																	? 'success'
																	: artist.AverageRating > 3
																	? 'warning'
																	: artist.AverageRating > 0
																	? 'danger'
																	: ''
															}`}
														>
															{artist.AverageRating || 'Not rated'}
														</span>
													</td>
													<td className='table-cell'>{truncateString(artist.StoreId)}</td>
													<td className='table-cell actions'>
														<button
															className='edit-btn'
															onClick={() => handleEditArtist(artist)}
															style={{
																marginRight: '5px',
																padding: '5px 10px',
																background: '#2196F3',
																color: 'white',
																border: 'none',
																borderRadius: '4px',
																cursor: 'pointer',
															}}
														>
															Edit
														</button>
														<button
															className='delete-btn'
															onClick={() => handleDeleteClick(artist.ID)}
															style={{
																padding: '5px 10px',
																background: '#f44336',
																color: 'white',
																border: 'none',
																borderRadius: '4px',
																cursor: 'pointer',
															}}
														>
															Delete
														</button>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						)}
					</>
				)}
			</div>

			{/* Edit Artist Modal */}
			{showEditModal && selectedArtist && (
				<EditArtistModal
					artist={selectedArtist}
					onClose={closeEditModal}
					onArtistUpdated={handleArtistUpdated}
				/>
			)}

			{/* Delete Confirmation Dialog */}
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
									{artistToDelete.FullName ||
										(artistToDelete.ID ? truncateString(artistToDelete.ID, 8) : 'Unknown')}
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
			{statusMessage.text && (
				<div
					className={`status-message ${statusMessage.type}`}
					style={{
						position: 'fixed',
						bottom: '20px',
						right: '20px',
						padding: '10px 20px',
						borderRadius: '4px',
						backgroundColor: statusMessage.type === 'success' ? '#4CAF50' : '#f44336',
						color: 'white',
						boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
						zIndex: 1000,
					}}
				>
					{statusMessage.text}
				</div>
			)}
		</div>
	);
}

export default Artist;