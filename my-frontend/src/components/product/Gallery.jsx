import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const ROOMS = [
    {
        id: "living-room",
        name: "🛋️ Phòng khách Cozy",
        url: "https://threejs.org/examples/textures/kandao3.jpg"
    },
    {
        id: "garden",
        name: "🌳 Sân vườn nắng ấm",
        url: "https://threejs.org/examples/textures/2294472375_b4a4940d4c_o.jpg"
    }
];

function Gallery() {
    const [images, setImages] = useState([]);
    const [activeTab, setActiveTab] = useState("photos"); // "photos" | "360"
    const [activeRoom, setActiveRoom] = useState(ROOMS[0]);
    const [isLoading360, setIsLoading360] = useState(true);
    
    const containerRef = useRef(null);

    useEffect(() => {
        fetch("/api/gallery")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setImages(data.map(item => item.imageUrl));
                } else {
                    setImages([
                        "https://images.unsplash.com/photo-1501183638710-841dd1904471",
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                        "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
                        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                        "https://images.unsplash.com/photo-1484154218962-a197022b5858",
                        "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09"
                    ]);
                }
            })
            .catch(err => {
                console.error("Lỗi khi tải gallery:", err);
                setImages([
                    "https://images.unsplash.com/photo-1501183638710-841dd1904471",
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858",
                    "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09"
                ]);
            });
    }, []);

    useEffect(() => {
        if (activeTab !== "360" || !containerRef.current) return;

        setIsLoading360(true);
        const container = containerRef.current;
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;

        // 1. Scene
        const scene = new THREE.Scene();

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
        camera.target = new THREE.Vector3(0, 0, 0);

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        // 4. Inverted Sphere for Panorama mapping
        const geometry = new THREE.SphereGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(
            activeRoom.url,
            () => {
                setIsLoading360(false);
            },
            undefined,
            (err) => {
                console.error("Lỗi load ảnh 360:", err);
                setIsLoading360(false);
            }
        );

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // 5. Drag variables
        let isUserInteracting = false;
        let onPointerDownMouseX = 0, onPointerDownMouseY = 0;
        let lon = 0, onPointerDownLon = 0;
        let lat = 0, onPointerDownLat = 0;
        let phi = 0, theta = 0;

        const onPointerDown = (event) => {
            isUserInteracting = true;
            onPointerDownMouseX = event.clientX;
            onPointerDownMouseY = event.clientY;
            onPointerDownLon = lon;
            onPointerDownLat = lat;
        };

        const onPointerMove = (event) => {
            if (isUserInteracting) {
                lon = (onPointerDownMouseX - event.clientX) * 0.15 + onPointerDownLon;
                lat = (event.clientY - onPointerDownMouseY) * 0.15 + onPointerDownLat;
            }
        };

        const onPointerUp = () => {
            isUserInteracting = false;
        };

        container.addEventListener("pointerdown", onPointerDown);
        container.addEventListener("pointermove", onPointerMove);
        container.addEventListener("pointerup", onPointerUp);

        const handleResize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", handleResize);

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            if (!isUserInteracting) {
                // Slow rotation effect for cozy idle state
                lon += 0.03;
            }

            lat = Math.max(-85, Math.min(85, lat));
            phi = THREE.MathUtils.degToRad(90 - lat);
            theta = THREE.MathUtils.degToRad(lon);

            camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
            camera.target.y = 500 * Math.cos(phi);
            camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

            camera.lookAt(camera.target);
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            container.removeEventListener("pointerdown", onPointerDown);
            container.removeEventListener("pointermove", onPointerMove);
            container.removeEventListener("pointerup", onPointerUp);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            texture.dispose();
            renderer.dispose();
        };
    }, [activeTab, activeRoom]);

    return (
        <section className="gallery">
            <p className="gallery-subtitle">OUR GALLERY</p>
            <h2 className="gallery-title">3D Renderings & 360° Panorama</h2>
            <p className="gallery-desc">
                Khám phá không gian thực tế ảo 360 độ hoặc phối cảnh góc nhìn rộng
            </p>

            <div className="gallery-tabs">
                <button 
                    className={`gallery-tab-btn ${activeTab === "photos" ? "active" : ""}`}
                    onClick={() => setActiveTab("photos")}
                >
                    📸 Ảnh Phối Cảnh
                </button>
                <button 
                    className={`gallery-tab-btn ${activeTab === "360" ? "active" : ""}`}
                    onClick={() => setActiveTab("360")}
                >
                    🕶️ Không Gian 360°
                </button>
            </div>

            {activeTab === "photos" ? (
                <div className="gallery-grid">
                    {images.map((img, index) => (
                        <div className="gallery-card" key={index}>
                            <img src={img} alt={`Gallery item ${index + 1}`} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="panorama-container-wrapper">
                    <div className="panorama-viewer-container" ref={containerRef}>
                        {isLoading360 && (
                            <div className="panorama-loading">
                                <div className="cozy-spinner"></div>
                                <span>Đang tải không gian 360°...</span>
                            </div>
                        )}
                        <div className="panorama-overlay-instruction">
                            💡 Kéo thả chuột hoặc vuốt màn hình để xoay góc nhìn 360°
                        </div>
                    </div>
                    
                    <div className="panorama-room-selector">
                        {ROOMS.map(room => (
                            <button
                                key={room.id}
                                className={`panorama-room-btn ${activeRoom.id === room.id ? "active" : ""}`}
                                onClick={() => {
                                    if (activeRoom.id !== room.id) {
                                        setActiveRoom(room);
                                    }
                                }}
                            >
                                {room.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export default Gallery;